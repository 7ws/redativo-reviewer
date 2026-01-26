"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import Header from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Institution from "@/types/institution";
import Invitation, { InvitationStatus } from "@/types/invitation";
import Theme from "@/types/theme";

type UserListItem = {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  created_at: string;
  avatar_image: string | null;
  institution: { id: string; name: string } | null;
  temporary_password?: string;
};

type Writer = {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
  google_picture_url: string | null;
};

type InvitationsResponse = {
  results: Invitation[];
  writer_count: number;
  writer_limit: number;
  remaining_slots: number;
};

const STATUS_LABELS: Record<InvitationStatus, string> = {
  ACTIVE: "Pendente",
  ACCEPTED: "Aceito",
  EXPIRED: "Expirado",
  REVOKED: "Revogado",
  CANCELLED: "Cancelado",
};

const STATUS_STYLES: Record<InvitationStatus, string> = {
  ACTIVE: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-600",
  REVOKED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function InstitutionManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({ requireAuth: true });

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [administrators, setAdministrators] = useState<UserListItem[]>([]);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [writerLimit, setWriterLimit] = useState({
    count: 0,
    limit: 10,
    remaining: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingInstitution, setEditingInstitution] = useState(false);
  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    description: "",
  });

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    username: "",
    full_name: "",
    email: "",
    phone_number: "",
  });
  const [newAdminPassword, setNewAdminPassword] = useState<string | null>(null);

  const [showInvitationForm, setShowInvitationForm] = useState(false);
  const [invitationType, setInvitationType] = useState<"EMAIL" | "CODE">(
    "EMAIL",
  );
  const [emailInvitationForm, setEmailInvitationForm] = useState({
    email: "",
    notes: "",
  });
  const [codeInvitationForm, setCodeInvitationForm] = useState({
    available_since: "",
    available_until: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [showThemeForm, setShowThemeForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [themeForm, setThemeForm] = useState({
    title: "",
    description: "",
    short_description: "",
    available_since: "",
    available_until: "",
  });

  useEffect(() => {
    if (!user?.institution?.id) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const [instRes, adminsRes, writersRes, invitationsRes, themesRes] =
        await Promise.all([
          apiRequest<Institution>(
            `/api/v1/institutions/${user!.institution!.id}/`,
            { method: "GET" },
            router,
          ),
          apiRequest<UserListItem[]>(
            "/api/v1/administrators/",
            { method: "GET" },
            router,
          ),
          apiRequest<Writer[]>("/api/v1/writers/", { method: "GET" }, router),
          apiRequest<InvitationsResponse>(
            "/api/v1/invitations/",
            { method: "GET" },
            router,
          ),
          apiRequest<Theme[]>(
            "/api/v1/administrator/themes/",
            { method: "GET" },
            router,
          ),
        ]);

      if (instRes.ok && instRes.data) {
        setInstitution(instRes.data);
        setInstitutionForm({
          name: instRes.data.name,
          description: instRes.data.description || "",
        });
      }
      if (adminsRes.ok && adminsRes.data) setAdministrators(adminsRes.data);
      if (writersRes.ok && writersRes.data) setWriters(writersRes.data);
      if (invitationsRes.ok && invitationsRes.data) {
        setInvitations(invitationsRes.data.results);
        setWriterLimit({
          count: invitationsRes.data.writer_count,
          limit: invitationsRes.data.writer_limit,
          remaining: invitationsRes.data.remaining_slots,
        });
      }
      if (themesRes.ok && themesRes.data) setThemes(themesRes.data);

      if (!instRes.ok) setError(instRes.error || "Erro ao carregar dados");

      setLoading(false);
    }

    fetchData();
  }, [user, router]);

  const handleUpdateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution) return;

    setSubmitting(true);
    const { data, ok, error } = await apiRequest<Institution>(
      `/api/v1/institutions/${institution.id}/`,
      { method: "PATCH", body: institutionForm },
      router,
    );

    if (ok && data) {
      setInstitution(data);
      setEditingInstitution(false);
    } else {
      setError(error || "Erro ao atualizar instituicao");
    }
    setSubmitting(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNewAdminPassword(null);

    const { data, ok, error } = await apiRequest<UserListItem>(
      "/api/v1/administrators/",
      { method: "POST", body: adminForm },
      router,
    );

    if (ok && data) {
      setAdministrators([...administrators, data]);
      if (data.temporary_password) {
        setNewAdminPassword(data.temporary_password);
      }
      setAdminForm({
        username: "",
        full_name: "",
        email: "",
        phone_number: "",
      });
    } else {
      setError(error || "Erro ao criar administrador");
    }
    setSubmitting(false);
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const body =
      invitationType === "EMAIL"
        ? { type: "EMAIL", ...emailInvitationForm }
        : { type: "CODE", ...codeInvitationForm };

    const { data, ok, error } = await apiRequest<Invitation>(
      "/api/v1/invitations/",
      { method: "POST", body },
      router,
    );

    if (ok && data) {
      setInvitations([data, ...invitations]);
      setEmailInvitationForm({ email: "", notes: "" });
      setCodeInvitationForm({
        available_since: "",
        available_until: "",
        notes: "",
      });
      setShowInvitationForm(false);
      if (invitationType === "EMAIL") {
        setWriterLimit((prev) => ({
          ...prev,
          count: prev.count + 1,
          remaining: prev.remaining - 1,
        }));
      }
    } else {
      setError(error || "Erro ao criar convite");
    }
    setSubmitting(false);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const { data, ok } = await apiRequest<Invitation>(
      `/api/v1/invitations/${invitationId}/cancel/`,
      { method: "POST" },
      router,
    );

    if (ok && data) {
      setInvitations(
        invitations.map((inv) => (inv.id === invitationId ? data : inv)),
      );
      if (data.type === "EMAIL") {
        setWriterLimit((prev) => ({
          ...prev,
          count: prev.count - 1,
          remaining: prev.remaining + 1,
        }));
      }
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    const { data, ok } = await apiRequest<Invitation>(
      `/api/v1/invitations/${invitationId}/revoke/`,
      { method: "POST" },
      router,
    );

    if (ok && data) {
      setInvitations(
        invitations.map((inv) => (inv.id === invitationId ? data : inv)),
      );
      if (data.type === "EMAIL") {
        setWriterLimit((prev) => ({
          ...prev,
          count: prev.count - 1,
          remaining: prev.remaining + 1,
        }));
      }
    }
  };

  const resetThemeForm = () => {
    setThemeForm({
      title: "",
      description: "",
      short_description: "",
      available_since: "",
      available_until: "",
    });
  };

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data, ok, error } = await apiRequest<Theme>(
      "/api/v1/administrator/themes/",
      { method: "POST", body: themeForm },
      router,
    );

    if (ok && data) {
      setThemes([data, ...themes]);
      setShowThemeForm(false);
      resetThemeForm();
    } else {
      setError(error || "Erro ao criar tema");
    }
    setSubmitting(false);
  };

  const handleUpdateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTheme) return;
    setSubmitting(true);

    const { data, ok, error } = await apiRequest<Theme>(
      `/api/v1/administrator/themes/${editingTheme.id}/`,
      { method: "PATCH", body: themeForm },
      router,
    );

    if (ok && data) {
      setThemes(themes.map((t) => (t.id === data.id ? data : t)));
      setEditingTheme(null);
      resetThemeForm();
    } else {
      setError(error || "Erro ao atualizar tema");
    }
    setSubmitting(false);
  };

  const startEditingTheme = (theme: Theme) => {
    setEditingTheme(theme);
    setThemeForm({
      title: theme.title,
      description: theme.description,
      short_description: theme.short_description,
      available_since: theme.available_since.slice(0, 16),
      available_until: theme.available_until.slice(0, 16),
    });
    setShowThemeForm(false);
  };

  const cancelEditingTheme = () => {
    setEditingTheme(null);
    resetThemeForm();
  };

  const getThemeStatus = (theme: Theme) => {
    const now = new Date();
    const since = new Date(theme.available_since);
    const until = new Date(theme.available_until);

    if (now < since) return "future";
    if (now > until) return "past";
    return "active";
  };

  if (authLoading || loading) {
    return <p className="p-6 text-center">Carregando...</p>;
  }

  if (!user?.institution) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showProfileButton={true} user={user} />
        <div className="p-6">
          <p className="text-gray-600">
            Voce nao esta associado a nenhuma instituicao.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showProfileButton={true} user={user} />

      <div className="max-w-4xl mx-auto p-6">
        <Link
          href="/administrators"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          &larr; Voltar
        </Link>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        )}

        <Tabs defaultValue="institution" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="institution">Instituicao</TabsTrigger>
            <TabsTrigger value="administrators">Administradores</TabsTrigger>
            <TabsTrigger value="writers">Escritores</TabsTrigger>
            <TabsTrigger value="invitations">Convites</TabsTrigger>
            <TabsTrigger value="themes">Temas</TabsTrigger>
          </TabsList>

          <TabsContent value="institution">
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Instituicao</h2>
                {!editingInstitution && (
                  <button
                    onClick={() => setEditingInstitution(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                )}
              </div>

              {editingInstitution ? (
                <form onSubmit={handleUpdateInstitution} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={institutionForm.name}
                      onChange={(e) =>
                        setInstitutionForm({
                          ...institutionForm,
                          name: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descricao
                    </label>
                    <textarea
                      value={institutionForm.description}
                      onChange={(e) =>
                        setInstitutionForm({
                          ...institutionForm,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInstitution(false);
                        if (institution) {
                          setInstitutionForm({
                            name: institution.name,
                            description: institution.description || "",
                          });
                        }
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-lg font-medium">{institution?.name}</p>
                  {institution?.description && (
                    <p className="text-gray-600 mt-2">
                      {institution.description}
                    </p>
                  )}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="administrators">
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Administradores</h2>
                <button
                  onClick={() => setShowAdminForm(!showAdminForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {showAdminForm ? "Cancelar" : "Novo Administrador"}
                </button>
              </div>

              {showAdminForm && (
                <form
                  onSubmit={handleCreateAdmin}
                  className="mb-6 p-4 bg-gray-50 rounded space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Usuario *
                      </label>
                      <input
                        type="text"
                        value={adminForm.username}
                        onChange={(e) =>
                          setAdminForm({
                            ...adminForm,
                            username: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={adminForm.full_name}
                        onChange={(e) =>
                          setAdminForm({
                            ...adminForm,
                            full_name: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={adminForm.email}
                        onChange={(e) =>
                          setAdminForm({ ...adminForm, email: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={adminForm.phone_number}
                        onChange={(e) =>
                          setAdminForm({
                            ...adminForm,
                            phone_number: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? "Criando..." : "Criar Administrador"}
                  </button>
                </form>
              )}

              {newAdminPassword && (
                <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
                  <p className="font-medium">
                    Senha temporaria do novo administrador:
                  </p>
                  <p className="font-mono text-lg">{newAdminPassword}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Guarde esta senha, ela nao sera exibida novamente.
                  </p>
                  <button
                    onClick={() => setNewAdminPassword(null)}
                    className="mt-2 text-sm text-blue-600"
                  >
                    Fechar
                  </button>
                </div>
              )}

              <ul className="divide-y divide-gray-200">
                {administrators.map((admin) => (
                  <li
                    key={admin.id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{admin.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {admin.email || "Sem email"}
                      </p>
                    </div>
                  </li>
                ))}
                {administrators.length === 0 && (
                  <li className="py-3 text-gray-500">
                    Nenhum administrador encontrado.
                  </li>
                )}
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="writers">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Escritores</h2>

              <ul className="divide-y divide-gray-200">
                {writers.map((writer) => (
                  <li
                    key={writer.id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      {writer.google_picture_url && (
                        <img
                          src={writer.google_picture_url}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{writer.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {writer.email || "Sem email"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                {writers.length === 0 && (
                  <li className="py-3 text-gray-500">
                    Nenhum escritor encontrado.
                  </li>
                )}
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="invitations">
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold">Convites</h2>
                  <p className="text-sm text-gray-500">
                    {writerLimit.count} de {writerLimit.limit} vagas utilizadas
                  </p>
                </div>
                <button
                  onClick={() => setShowInvitationForm(!showInvitationForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={
                    writerLimit.remaining <= 0 && invitationType === "EMAIL"
                  }
                >
                  {showInvitationForm ? "Cancelar" : "Novo Convite"}
                </button>
              </div>

              {showInvitationForm && (
                <form
                  onSubmit={handleCreateInvitation}
                  className="mb-6 p-4 bg-gray-50 rounded space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Convite
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="EMAIL"
                          checked={invitationType === "EMAIL"}
                          onChange={() => setInvitationType("EMAIL")}
                          className="mr-2"
                        />
                        Email
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="CODE"
                          checked={invitationType === "CODE"}
                          onChange={() => setInvitationType("CODE")}
                          className="mr-2"
                        />
                        Codigo
                      </label>
                    </div>
                  </div>

                  {invitationType === "EMAIL" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={emailInvitationForm.email}
                          onChange={(e) =>
                            setEmailInvitationForm({
                              ...emailInvitationForm,
                              email: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Observacoes
                        </label>
                        <textarea
                          value={emailInvitationForm.notes}
                          onChange={(e) =>
                            setEmailInvitationForm({
                              ...emailInvitationForm,
                              notes: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                          rows={2}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Disponivel a partir de *
                          </label>
                          <input
                            type="datetime-local"
                            value={codeInvitationForm.available_since}
                            onChange={(e) =>
                              setCodeInvitationForm({
                                ...codeInvitationForm,
                                available_since: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Disponivel ate
                          </label>
                          <input
                            type="datetime-local"
                            value={codeInvitationForm.available_until}
                            onChange={(e) =>
                              setCodeInvitationForm({
                                ...codeInvitationForm,
                                available_until: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Observacoes
                        </label>
                        <textarea
                          value={codeInvitationForm.notes}
                          onChange={(e) =>
                            setCodeInvitationForm({
                              ...codeInvitationForm,
                              notes: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                          rows={2}
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      (writerLimit.remaining <= 0 && invitationType === "EMAIL")
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? "Criando..." : "Criar Convite"}
                  </button>
                </form>
              )}

              <ul className="divide-y divide-gray-200">
                {invitations.map((invitation) => (
                  <li
                    key={invitation.id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      {invitation.type === "CODE" ? (
                        <p className="font-mono font-medium">
                          {invitation.code}
                        </p>
                      ) : (
                        <p className="font-medium">{invitation.email}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {invitation.type === "CODE" ? "Codigo" : "Email"}
                        {invitation.notes && ` - ${invitation.notes}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${STATUS_STYLES[invitation.status]}`}
                      >
                        {STATUS_LABELS[invitation.status]}
                      </span>

                      {invitation.status === "ACTIVE" && (
                        <button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Cancelar
                        </button>
                      )}

                      {invitation.status === "ACCEPTED" && (
                        <button
                          onClick={() => handleRevokeInvitation(invitation.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Revogar
                        </button>
                      )}
                    </div>
                  </li>
                ))}
                {invitations.length === 0 && (
                  <li className="py-3 text-gray-500">
                    Nenhum convite encontrado.
                  </li>
                )}
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="themes">
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Temas</h2>
                {!editingTheme && (
                  <button
                    onClick={() => setShowThemeForm(!showThemeForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {showThemeForm ? "Cancelar" : "Novo Tema"}
                  </button>
                )}
              </div>

              {(showThemeForm || editingTheme) && (
                <form
                  onSubmit={
                    editingTheme ? handleUpdateTheme : handleCreateTheme
                  }
                  className="mb-6 p-4 bg-gray-50 rounded space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Titulo *
                    </label>
                    <input
                      type="text"
                      value={themeForm.title}
                      onChange={(e) =>
                        setThemeForm({ ...themeForm, title: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descricao Curta *
                    </label>
                    <input
                      type="text"
                      value={themeForm.short_description}
                      onChange={(e) =>
                        setThemeForm({
                          ...themeForm,
                          short_description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descricao
                    </label>
                    <textarea
                      value={themeForm.description}
                      onChange={(e) =>
                        setThemeForm({
                          ...themeForm,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Disponivel a partir de *
                      </label>
                      <input
                        type="datetime-local"
                        value={themeForm.available_since}
                        onChange={(e) =>
                          setThemeForm({
                            ...themeForm,
                            available_since: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Disponivel ate *
                      </label>
                      <input
                        type="datetime-local"
                        value={themeForm.available_until}
                        onChange={(e) =>
                          setThemeForm({
                            ...themeForm,
                            available_until: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {submitting
                        ? "Salvando..."
                        : editingTheme
                          ? "Atualizar Tema"
                          : "Criar Tema"}
                    </button>
                    {editingTheme && (
                      <button
                        type="button"
                        onClick={cancelEditingTheme}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              )}

              <ul className="divide-y divide-gray-200">
                {themes.map((theme) => {
                  const status = getThemeStatus(theme);
                  return (
                    <li
                      key={theme.id}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{theme.title}</p>
                        <p className="text-sm text-gray-500">
                          {theme.short_description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(theme.available_since).toLocaleDateString(
                            "pt-BR",
                          )}{" "}
                          -{" "}
                          {new Date(theme.available_until).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            status === "active"
                              ? "bg-green-100 text-green-800"
                              : status === "future"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status === "active"
                            ? "Ativo"
                            : status === "future"
                              ? "Futuro"
                              : "Encerrado"}
                        </span>
                        {status === "future" && (
                          <button
                            onClick={() => startEditingTheme(theme)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
                {themes.length === 0 && (
                  <li className="py-3 text-gray-500">
                    Nenhum tema encontrado.
                  </li>
                )}
              </ul>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
