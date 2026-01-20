"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import Header from "@/components/header";
import Institution from "@/types/institution";
import UserProfile from "@/types/user_profile";
import Invitation from "@/types/invitation";

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

export default function InstitutionManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({ requireAuth: true });

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [administrators, setAdministrators] = useState<UserListItem[]>([]);
  const [reviewers, setReviewers] = useState<UserListItem[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
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

  const [showReviewerForm, setShowReviewerForm] = useState(false);
  const [reviewerForm, setReviewerForm] = useState({
    username: "",
    full_name: "",
    email: "",
    phone_number: "",
  });
  const [newReviewerPassword, setNewReviewerPassword] = useState<string | null>(
    null,
  );

  const [showInvitationForm, setShowInvitationForm] = useState(false);
  const [invitationForm, setInvitationForm] = useState({
    email: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.institution?.id) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const [instRes, adminsRes, reviewersRes, invitationsRes] =
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
          apiRequest<UserListItem[]>(
            "/api/v1/reviewers/",
            { method: "GET" },
            router,
          ),
          apiRequest<Invitation[]>(
            "/api/v1/invitations/",
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
      if (reviewersRes.ok && reviewersRes.data) setReviewers(reviewersRes.data);
      if (invitationsRes.ok && invitationsRes.data)
        setInvitations(invitationsRes.data);

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
      setError(error || "Erro ao atualizar instituição");
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

  const handleCreateReviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNewReviewerPassword(null);

    const { data, ok, error } = await apiRequest<UserListItem>(
      "/api/v1/reviewers/",
      { method: "POST", body: reviewerForm },
      router,
    );

    if (ok && data) {
      setReviewers([...reviewers, data]);
      if (data.temporary_password) {
        setNewReviewerPassword(data.temporary_password);
      }
      setReviewerForm({
        username: "",
        full_name: "",
        email: "",
        phone_number: "",
      });
    } else {
      setError(error || "Erro ao criar corretor");
    }
    setSubmitting(false);
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data, ok, error } = await apiRequest<Invitation>(
      "/api/v1/invitations/",
      { method: "POST", body: invitationForm },
      router,
    );

    if (ok && data) {
      setInvitations([...invitations, data]);
      setInvitationForm({ email: "", notes: "" });
      setShowInvitationForm(false);
    } else {
      setError(error || "Erro ao criar convite");
    }
    setSubmitting(false);
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
            Você não está associado a nenhuma instituição.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showProfileButton={true} user={user} />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Link
          href="/administrators"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          &larr; Voltar
        </Link>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Institution Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Instituição</h2>
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
                  Descrição
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
                <p className="text-gray-600 mt-2">{institution.description}</p>
              )}
            </div>
          )}
        </section>

        {/* Administrators Section */}
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
                    Usuário *
                  </label>
                  <input
                    type="text"
                    value={adminForm.username}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, username: e.target.value })
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
                      setAdminForm({ ...adminForm, full_name: e.target.value })
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
                Senha temporária do novo administrador:
              </p>
              <p className="font-mono text-lg">{newAdminPassword}</p>
              <p className="text-sm text-gray-600 mt-2">
                Guarde esta senha, ela não será exibida novamente.
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

        {/* Reviewers Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Corretores</h2>
            <button
              onClick={() => setShowReviewerForm(!showReviewerForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showReviewerForm ? "Cancelar" : "Novo Corretor"}
            </button>
          </div>

          {showReviewerForm && (
            <form
              onSubmit={handleCreateReviewer}
              className="mb-6 p-4 bg-gray-50 rounded space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usuário *
                  </label>
                  <input
                    type="text"
                    value={reviewerForm.username}
                    onChange={(e) =>
                      setReviewerForm({
                        ...reviewerForm,
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
                    value={reviewerForm.full_name}
                    onChange={(e) =>
                      setReviewerForm({
                        ...reviewerForm,
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
                    value={reviewerForm.email}
                    onChange={(e) =>
                      setReviewerForm({
                        ...reviewerForm,
                        email: e.target.value,
                      })
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
                    value={reviewerForm.phone_number}
                    onChange={(e) =>
                      setReviewerForm({
                        ...reviewerForm,
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
                {submitting ? "Criando..." : "Criar Corretor"}
              </button>
            </form>
          )}

          {newReviewerPassword && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
              <p className="font-medium">Senha temporária do novo corretor:</p>
              <p className="font-mono text-lg">{newReviewerPassword}</p>
              <p className="text-sm text-gray-600 mt-2">
                Guarde esta senha, ela não será exibida novamente.
              </p>
              <button
                onClick={() => setNewReviewerPassword(null)}
                className="mt-2 text-sm text-blue-600"
              >
                Fechar
              </button>
            </div>
          )}

          <ul className="divide-y divide-gray-200">
            {reviewers.map((reviewer) => (
              <li
                key={reviewer.id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{reviewer.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {reviewer.email || "Sem email"}
                  </p>
                </div>
              </li>
            ))}
            {reviewers.length === 0 && (
              <li className="py-3 text-gray-500">
                Nenhum corretor encontrado.
              </li>
            )}
          </ul>
        </section>

        {/* Invitations Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Convites</h2>
            <button
              onClick={() => setShowInvitationForm(!showInvitationForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={invitationForm.email}
                  onChange={(e) =>
                    setInvitationForm({
                      ...invitationForm,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  value={invitationForm.notes}
                  onChange={(e) =>
                    setInvitationForm({
                      ...invitationForm,
                      notes: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Enviando..." : "Enviar Convite"}
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
                  <p className="font-medium">{invitation.email}</p>
                  {invitation.notes && (
                    <p className="text-sm text-gray-500">{invitation.notes}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    invitation.accepted_at
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {invitation.accepted_at ? "Aceito" : "Pendente"}
                </span>
              </li>
            ))}
            {invitations.length === 0 && (
              <li className="py-3 text-gray-500">Nenhum convite encontrado.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
