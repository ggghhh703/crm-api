```jsx
import React, { useEffect, useMemo, useState } from "react";

const API_URL = "https://crm-api-408i.onrender.com";

const TOKEN_KEY = "crm_token";
const USER_KEY = "crm_user";
const THEME_KEY = "crm_dark_mode";

const PLATFORMS = [
  "Facebook",
  "Instagram",
  "WhatsApp",
  "Google",
  "Referral",
  "Website",
  "Other",
];

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Converted",
  "Closed",
];

const DEAL_STATUSES = [
  "Open",
  "Won",
  "Lost",
];

const TASK_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
];

const TASK_PRIORITIES = [
  "Low",
  "Medium",
  "High",
];

const emptyCustomer = {
  name: "",
  email: "",
  phone: "",
  company: "",
};

const emptyLead = {
  name: "",
  phone: "",
  email: "",
  message: "",
  platform: "Other",
  externalLeadId: "",
  status: "New",
};

const emptyDeal = {
  title: "",
  customerId: "",
  amount: "",
  status: "Open",
  notes: "",
};

const emptyInteraction = {
  customerId: "",
  type: "Call",
  message: "",
};

const emptyTask = {
  title: "",
  description: "",
  customerId: "",
  status: "Pending",
  priority: "Medium",
  dueDate: "",
};

function getArray(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.[key])) {
    return data.data[key];
  }

  return [];
}

async function api(path, options = {}, token = "") {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

function Modal({
  title,
  onClose,
  children,
  width = 560,
}) {
  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.modal,
          maxWidth: width,
        }}
      >
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let background = "#eef2ff";
  let color = "#4338ca";

  if (
    status === "Won" ||
    status === "Converted" ||
    status === "Completed"
  ) {
    background = "#dcfce7";
    color = "#166534";
  }

  if (
    status === "Lost" ||
    status === "Closed"
  ) {
    background = "#fee2e2";
    color = "#991b1b";
  }

  if (
    status === "Contacted" ||
    status === "In Progress"
  ) {
    background = "#fef3c7";
    color = "#92400e";
  }

  if (status === "Pending") {
    background = "#dbeafe";
    color = "#1d4ed8";
  }

  return (
    <span
      style={{
        ...styles.badge,
        background,
        color,
      }}
    >
      {status || "—"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  let background = "#f1f5f9";
  let color = "#475569";

  if (priority === "High") {
    background = "#fee2e2";
    color = "#991b1b";
  }

  if (priority === "Medium") {
    background = "#fef3c7";
    color = "#92400e";
  }

  if (priority === "Low") {
    background = "#dcfce7";
    color = "#166534";
  }

  return (
    <span
      style={{
        ...styles.badge,
        background,
        color,
      }}
    >
      {priority || "—"}
    </span>
  );
}

function AuthScreen({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  handleAuth,
  authLoading,
  authError,
}) {
  const isLogin = authMode === "login";

  return (
    <div style={styles.authPage}>
      <div style={styles.authCard}>
        <div style={styles.authLogo}>🚀</div>

        <h1 style={styles.authTitle}>CRM Pro</h1>

        <p style={styles.authSubtitle}>
          {isLogin
            ? "Login to your CRM"
            : "Create your CRM account"}
        </p>

        {authError && (
          <div style={styles.errorBox}>
            {authError}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div style={styles.formGroup}>
            <label style={styles.label}>ID</label>

            <input
              type="text"
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
              placeholder="Enter your ID"
              value={authForm.name}
              onChange={(e) =>
                setAuthForm({
                  ...authForm,
                  name: e.target.value,
                })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Password
            </label>

            <input
              type="password"
              required
              minLength={6}
              autoComplete={
                isLogin
                  ? "current-password"
                  : "new-password"
              }
              placeholder="Enter your password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({
                  ...authForm,
                  password: e.target.value,
                })
              }
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            style={{
              ...styles.primaryButton,
              width: "100%",
              opacity: authLoading ? 0.7 : 1,
            }}
          >
            {authLoading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <div style={styles.authSwitch}>
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setAuthMode(
                isLogin ? "signup" : "login"
              );

              setAuthForm({
                name: "",
                password: "",
              });
            }}
            style={styles.linkButton}
          >
            {isLogin ? " Sign Up" : " Login"}
          </button>
        </div>

        <p style={styles.authNote}>
          Login uses ID and password only.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );

  const [currentUser, setCurrentUser] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(USER_KEY) || "null"
        );
      } catch {
        return null;
      }
    });

  const [authMode, setAuthMode] =
    useState("login");

  const [authForm, setAuthForm] = useState({
    name: "",
    password: "",
  });

  const [authLoading, setAuthLoading] =
    useState(false);

  const [authError, setAuthError] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(
      () =>
        localStorage.getItem(THEME_KEY) ===
        "true"
    );

  const [page, setPage] =
    useState("Dashboard");

  const [customers, setCustomers] =
    useState([]);

  const [leads, setLeads] =
    useState([]);

  const [deals, setDeals] =
    useState([]);

  const [interactions, setInteractions] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [leadLoading, setLeadLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [leadSearch, setLeadSearch] =
    useState("");

  const [dealSearch, setDealSearch] =
    useState("");

  const [taskSearch, setTaskSearch] =
    useState("");

  const [
    showCustomerModal,
    setShowCustomerModal,
  ] = useState(false);

  const [
    showLeadModal,
    setShowLeadModal,
  ] = useState(false);

  const [
    showDealModal,
    setShowDealModal,
  ] = useState(false);

  const [
    showInteractionModal,
    setShowInteractionModal,
  ] = useState(false);

  const [
    showTaskModal,
    setShowTaskModal,
  ] = useState(false);

  const [
    editingCustomer,
    setEditingCustomer,
  ] = useState(null);

  const [
    editingLead,
    setEditingLead,
  ] = useState(null);

  const [
    editingDeal,
    setEditingDeal,
  ] = useState(null);

  const [
    editingTask,
    setEditingTask,
  ] = useState(null);

  const [
    customerForm,
    setCustomerForm,
  ] = useState(emptyCustomer);

  const [
    leadForm,
    setLeadForm,
  ] = useState(emptyLead);

  const [
    dealForm,
    setDealForm,
  ] = useState(emptyDeal);

  const [
    interactionForm,
    setInteractionForm,
  ] = useState(emptyInteraction);

  const [
    taskForm,
    setTaskForm,
  ] = useState(emptyTask);

  const [
    savingCustomer,
    setSavingCustomer,
  ] = useState(false);

  const [
    savingLead,
    setSavingLead,
  ] = useState(false);

  const [
    savingDeal,
    setSavingDeal,
  ] = useState(false);

  const [
    savingInteraction,
    setSavingInteraction,
  ] = useState(false);

  const [
    savingTask,
    setSavingTask,
  ] = useState(false);

  const [
    showCommunicationModal,
    setShowCommunicationModal,
  ] = useState(false);

  const [
    communicationCustomer,
    setCommunicationCustomer,
  ] = useState(null);

  const [
    communicationType,
    setCommunicationType,
  ] = useState("WhatsApp");

  useEffect(() => {
    localStorage.setItem(
      THEME_KEY,
      String(darkMode)
    );
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token]);

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      const [
        customerData,
        dealData,
        leadData,
        taskData,
      ] = await Promise.all([
        api("/customers", {}, token),
        api("/deals", {}, token),
        api("/leads", {}, token),
        api("/tasks", {}, token),
      ]);

      setCustomers(
        getArray(customerData, "customers")
      );

      setDeals(
        getArray(dealData, "deals")
      );

      setLeads(
        getArray(leadData, "leads")
      );

      setTasks(
        getArray(taskData, "tasks")
      );

      try {
        const interactionData =
          await api(
            "/interactions",
            {},
            token
          );

        setInteractions(
          getArray(
            interactionData,
            "interactions"
          )
        );
      } catch {
        setInteractions([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(e) {
    e.preventDefault();

    setAuthLoading(true);
    setAuthError("");

    try {
      const endpoint =
        authMode === "login"
          ? "/auth/login"
          : "/auth/register";

      const body = {
        name: authForm.name.trim(),
        password: authForm.password,
      };

      const data = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const receivedToken =
        data.token || data.accessToken;

      if (!receivedToken) {
        throw new Error(
          "Authentication token not received"
        );
      }

      const user =
        data.user || {
          id: "",
          name: authForm.name.trim(),
        };

      localStorage.setItem(
        TOKEN_KEY,
        receivedToken
      );

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );

      setToken(receivedToken);
      setCurrentUser(user);

      setAuthForm({
        name: "",
        password: "",
      });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken("");
    setCurrentUser(null);

    setCustomers([]);
    setLeads([]);
    setDeals([]);
    setInteractions([]);
    setTasks([]);

    setPage("Dashboard");
    setAuthMode("login");
    setAuthError("");
  }

  function openAddCustomer() {
    setEditingCustomer(null);

    setCustomerForm({
      ...emptyCustomer,
    });

    setShowCustomerModal(true);
  }

  function openEditCustomer(customer) {
    setEditingCustomer(customer);

    setCustomerForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
    });

    setShowCustomerModal(true);
  }

  async function saveCustomer(e) {
    e.preventDefault();

    setSavingCustomer(true);
    setError("");

    try {
      const payload = {
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
        company: customerForm.company.trim(),
      };

      if (!payload.name || !payload.phone) {
        throw new Error(
          "Name and phone are required"
        );
      }

      if (editingCustomer) {
        await api(
          `/customers/${editingCustomer._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          token
        );
      } else {
        await api(
          "/customers",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          token
        );
      }

      setShowCustomerModal(false);
      setEditingCustomer(null);

      setCustomerForm({
        ...emptyCustomer,
      });

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCustomer(false);
    }
  }

  async function deleteCustomer(id) {
    if (
      !window.confirm(
        "Delete this customer?"
      )
    ) {
      return;
    }

    try {
      await api(
        `/customers/${id}`,
        {
          method: "DELETE",
        },
        token
      );

      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function openAddLead() {
    setEditingLead(null);

    setLeadForm({
      ...emptyLead,
    });

    setShowLeadModal(true);
  }

  function openEditLead(lead) {
    setEditingLead(lead);

    setLeadForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      message: lead.message || "",
      platform: lead.platform || "Other",
      externalLeadId:
        lead.externalLeadId || "",
      status: lead.status || "New",
    });

    setShowLeadModal(true);
  }

  async function saveLead(e) {
    e.preventDefault();

    setSavingLead(true);
    setError("");

    try {
      const payload = {
        name: leadForm.name.trim(),
        phone: leadForm.phone.trim(),
        email: leadForm.email.trim(),
        message: leadForm.message.trim(),
        platform: leadForm.platform,
        externalLeadId:
          leadForm.externalLeadId.trim(),
        status: leadForm.status,
      };

      if (!payload.name || !payload.phone) {
        throw new Error(
          "Lead name and phone are required"
        );
      }

      if (editingLead) {
        await api(
          `/leads/${editingLead._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          token
        );
      } else {
        await api(
          "/leads",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          token
        );
      }

      setShowLeadModal(false);
      setEditingLead(null);

      setLeadForm({
        ...emptyLead,
      });

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingLead(false);
    }
  }

  async function deleteLead(id) {
    if (
      !window.confirm(
        "Delete this lead?"
      )
    ) {
      return;
    }

    try {
      await api(
        `/leads/${id}`,
        {
          method: "DELETE",
        },
        token
      );

      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function convertLead(lead) {
    if (lead.convertedToCustomer) {
      return;
    }

    if (
      !window.confirm(
        "Convert this lead into a customer?"
      )
    ) {
      return;
    }

    setLeadLoading(true);

    try {
      await api(
        `/leads/${lead._id}/convert`,
        {
          method: "POST",
        },
        token
      );

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setLeadLoading(false);
    }
  }

  function openAddDeal() {
    setEditingDeal(null);

    setDealForm({
      ...emptyDeal,
    });

    setShowDealModal(true);
  }

  function openEditDeal(deal) {
    setEditingDeal(deal);

    setDealForm({
      title: deal.title || "",
      customerId:
        deal.customerId?._id ||
        deal.customerId ||
        "",
      amount:
        deal.amount !== undefined
          ? String(deal.amount)
          : "",
      status: deal.status || "Open",
      notes: deal.notes || "",
    });

    setShowDealModal(true);
  }

  async function saveDeal(e) {
    e.preventDefault();

    setSavingDeal(true);
    setError("");

    try {
      const payload = {
        title: dealForm.title.trim(),
        customerId:
          dealForm.customerId || null,
        amount:
          Number(dealForm.amount) || 0,
        status: dealForm.status,
        notes: dealForm.notes.trim(),
      };

      if (!payload.title) {
        throw new Error(
          "Deal title is required"
        );
      }

      if (editingDeal) {
        await api(
          `/deals/${editingDeal._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          token
        );
      } else {
        await api(
          "/deals",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          token
        );
      }

      setShowDealModal(false);
      setEditingDeal(null);

      setDealForm({
        ...emptyDeal,
      });

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingDeal(false);
    }
  }

  async function deleteDeal(id) {
    if (
      !window.confirm(
        "Delete this deal?"
      )
    ) {
      return;
    }

    try {
      await api(
        `/deals/${id}`,
        {
          method: "DELETE",
        },
        token
      );

      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function openAddTask() {
    setEditingTask(null);

    setTaskForm({
      ...emptyTask,
    });

    setShowTaskModal(true);
  }

  function openEditTask(task) {
    setEditingTask(task);

    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      customerId:
        task.customerId?._id ||
        task.customerId ||
        "",
      status: task.status || "Pending",
      priority: task.priority || "Medium",
      dueDate: task.dueDate
        ? String(task.dueDate).slice(0, 10)
        : "",
    });

    setShowTaskModal(true);
  }

  async function saveTask(e) {
    e.preventDefault();

    setSavingTask(true);
    setError("");

    try {
      const payload = {
        title: taskForm.title.trim(),
        description:
          taskForm.description.trim(),
        customerId:
          taskForm.customerId || null,
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate:
          taskForm.dueDate || null,
      };

      if (!payload.title) {
        throw new Error(
          "Task title is required"
        );
      }

      if (editingTask) {
        await api(
          `/tasks/${editingTask._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          token
        );
      } else {
        await api(
          "/tasks",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          token
        );
      }

      setShowTaskModal(false);
      setEditingTask(null);

      setTaskForm({
        ...emptyTask,
      });

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTask(false);
    }
  }

  async function deleteTask(id) {
    if (
      !window.confirm(
        "Delete this task?"
      )
    ) {
      return;
    }

    try {
      await api(
        `/tasks/${id}`,
        {
          method: "DELETE",
        },
        token
      );

      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveInteraction(e) {
    e.preventDefault();

    setSavingInteraction(true);
    setError("");

    try {
      if (!interactionForm.customerId) {
        throw new Error(
          "Please select a customer"
        );
      }

      if (!interactionForm.message.trim()) {
        throw new Error(
          "Please enter a message"
        );
      }

      await api(
        "/interactions",
        {
          method: "POST",
          body: JSON.stringify({
            customerId:
              interactionForm.customerId,
            type: interactionForm.type,
            message:
              interactionForm.message.trim(),
          }),
        },
        token
      );

      setShowInteractionModal(false);

      setInteractionForm({
        ...emptyInteraction,
      });

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingInteraction(false);
    }
  }

  function openCommunication(customer) {
    setCommunicationCustomer(customer);
    setCommunicationType("WhatsApp");
    setShowCommunicationModal(true);
  }

  function startCommunication() {
    if (!communicationCustomer) {
      return;
    }

    const phone =
      communicationCustomer.phone?.replace(
        /\D/g,
        ""
      ) || "";

    if (!phone) {
      alert(
        "Customer phone number is missing."
      );
      return;
    }

    let url = "";

    if (communicationType === "WhatsApp") {
      url = `https://wa.me/${phone}`;
    } else if (
      communicationType === "Call"
    ) {
      url = `tel:${phone}`;
    } else if (
      communicationType === "SMS"
    ) {
      url = `sms:${phone}`;
    }

    if (url) {
      window.open(url, "_blank");
    }

    setShowCommunicationModal(false);
  }

  const filteredCustomers = useMemo(() => {
    const q =
      customerSearch.trim().toLowerCase();

    if (!q) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
        customer.company,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [customers, customerSearch]);

  const filteredLeads = useMemo(() => {
    const q =
      leadSearch.trim().toLowerCase();

    if (!q) return leads;

    return leads.filter((lead) =>
      [
        lead.name,
        lead.phone,
        lead.email,
        lead.platform,
        lead.status,
        lead.message,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [leads, leadSearch]);

  const filteredDeals = useMemo(() => {
    const q =
      dealSearch.trim().toLowerCase();

    if (!q) return deals;

    return deals.filter((deal) =>
      [
        deal.title,
        deal.status,
        deal.notes,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [deals, dealSearch]);

  const filteredTasks = useMemo(() => {
    const q =
      taskSearch.trim().toLowerCase();

    if (!q) return tasks;

    return tasks.filter((task) => {
      const customerName =
        task.customerId &&
        typeof task.customerId === "object"
          ? task.customerId.name
          : "";

      return [
        task.title,
        task.description,
        task.status,
        task.priority,
        customerName,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        );
    });
  }, [tasks, taskSearch]);

  const revenue = useMemo(
    () =>
      deals
        .filter(
          (deal) => deal.status === "Won"
        )
        .reduce(
          (total, deal) =>
            total +
            (Number(deal.amount) || 0),
          0
        ),
    [deals]
  );

  const newLeads = leads.filter(
    (lead) => lead.status === "New"
  ).length;

  const convertedLeads = leads.filter(
    (lead) =>
      lead.status === "Converted" ||
      lead.convertedToCustomer
  ).length;

  const openDeals = deals.filter(
    (deal) => deal.status === "Open"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  if (!token) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        handleAuth={handleAuth}
        authLoading={authLoading}
        authError={authError}
      />
    );
  }

  return (
    <div
      style={{
        ...styles.app,
        background: darkMode
          ? "#0f172a"
          : "#f8fafc",
        color: darkMode
          ? "#f8fafc"
          : "#0f172a",
      }}
    >
      <aside
        style={{
          ...styles.sidebar,
          background: darkMode
            ? "#111827"
            : "#ffffff",
          borderColor: darkMode
            ? "#1f2937"
            : "#e5e7eb",
        }}
      >
        <div style={styles.logo}>
          🚀 CRM Pro
        </div>

        <nav style={styles.nav}>
          {[
            ["Dashboard", "🏠"],
            ["Customers", "👥"],
            ["Leads", "🎯"],
            ["Deals", "💼"],
            ["Tasks", "✅"],
            ["Reports", "📊"],
            ["Settings", "⚙️"],
          ].map(([name, icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => setPage(name)}
              style={{
                ...styles.navButton,
                background:
                  page === name
                    ? darkMode
                      ? "#1e293b"
                      : "#eef2ff"
                    : "transparent",
                color:
                  page === name
                    ? "#4f46e5"
                    : darkMode
                    ? "#cbd5e1"
                    : "#475569",
              }}
            >
              <span>{icon}</span>
              <span>{name}</span>
            </button>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div
            style={{
              ...styles.userMini,
              background: darkMode
                ? "#1e293b"
                : "#f8fafc",
            }}
          >
            <div style={styles.avatar}>
              {(currentUser?.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div style={{ minWidth: 0 }}>
              <strong
                style={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser?.name || "User"}
              </strong>

              <small
                style={{
                  color: darkMode
                    ? "#94a3b8"
                    : "#64748b",
                }}
              >
                CRM Account
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={styles.logoutButton}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header
          style={{
            ...styles.topbar,
            background: darkMode
              ? "#111827"
              : "#ffffff",
            borderColor: darkMode
              ? "#1f2937"
              : "#e5e7eb",
          }}
        >
          <div>
            <h1 style={styles.pageTitle}>
              {page}
            </h1>

            <p
              style={{
                ...styles.pageSubtitle,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              Welcome,{" "}
              {currentUser?.name || "User"}
            </p>
          </div>

          <div style={styles.topActions}>
            <button
              type="button"
              onClick={() =>
                setDarkMode(!darkMode)
              }
              style={styles.iconButton}
              title="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <div
              style={{
                ...styles.connectionBadge,
                background: "#dcfce7",
                color: "#166534",
              }}
            >
              ● API Connected
            </div>
          </div>
        </header>

        {error && (
          <div style={styles.globalError}>
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              style={styles.errorClose}
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <div style={styles.loadingBar}>
            Loading CRM data...
          </div>
        )}

        <section style={styles.content}>
          {page === "Dashboard" && (
            <>
              <div style={styles.welcomeCard}>
                <div>
                  <div
                    style={
                      styles.welcomeEyebrow
                    }
                  >
                    CRM PRO
                  </div>

                  <h2
                    style={{
                      margin: "5px 0 8px",
                      fontSize: 27,
                    }}
                  >
                    Your business at a glance
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: darkMode
                        ? "#cbd5e1"
                        : "#64748b",
                    }}
                  >
                    Manage customers, leads,
                    deals and follow-ups from
                    one place.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddLead}
                  style={styles.primaryButton}
                >
                  + Add Lead
                </button>
              </div>

              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    👥
                  </div>

                  <div>
                    <div
                      style={styles.statLabel}
                    >
                      Total Customers
                    </div>

                    <div
                      style={styles.statValue}
                    >
                      {customers.length}
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    🎯
                  </div>

                  <div>
                    <div
                      style={styles.statLabel}
                    >
                      Total Leads
                    </div>

                    <div
                      style={styles.statValue}
                    >
                      {leads.length}
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    💼
                  </div>

                  <div>
                    <div
                      style={styles.statLabel}
                    >
                      Open Deals
                    </div>

                    <div
                      style={styles.statValue}
                    >
                      {openDeals}
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    💰
                  </div>

                  <div>
                    <div
                      style={styles.statLabel}
                    >
                      Won Revenue
                    </div>

                    <div
                      style={styles.statValue}
                    >
                      ₹
                      {revenue.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    ✅
                  </div>

                  <div>
                    <div
                      style={styles.statLabel}
                    >
                      Pending Tasks
                    </div>

                    <div
                      style={styles.statValue}
                    >
                      {pendingTasks}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.twoColumn}>
                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <div>
                      <h3
                        style={
                          styles.panelTitle
                        }
                      >
                        Recent Leads
                      </h3>

                      <p
                        style={
                          styles.panelSubtitle
                        }
                      >
                        Latest leads in your CRM
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPage("Leads")
                      }
                      style={
                        styles.secondaryButton
                      }
                    >
                      View All
                    </button>
                  </div>

                  {leads.length === 0 ? (
                    <EmptyState
                      icon="🎯"
                      title="No leads yet"
                      text="Add your first lead to get started."
                      button="+ Add Lead"
                      onClick={openAddLead}
                    />
                  ) : (
                    <div style={styles.list}>
                      {leads
                        .slice(0, 5)
                        .map((lead) => (
                          <div
                            key={lead._id}
                            style={
                              styles.listItem
                            }
                          >
                            <div
                              style={
                                styles.listAvatar
                              }
                            >
                              {(
                                lead.name || "L"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <strong>
                                {lead.name}
                              </strong>

                              <div
                                style={
                                  styles.smallText
                                }
                              >
                                {lead.phone}
                              </div>
                            </div>

                            <StatusBadge
                              status={
                                lead.status
                              }
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <div>
                      <h3
                        style={
                          styles.panelTitle
                        }
                      >
                        Quick Actions
                      </h3>

                      <p
                        style={
                          styles.panelSubtitle
                        }
                      >
                        Common CRM actions
                      </p>
                    </div>
                  </div>

                  <div style={styles.quickGrid}>
                    <button
                      type="button"
                      onClick={openAddCustomer}
                      style={
                        styles.quickButton
                      }
                    >
                      <span>👥</span>
                      <strong>
                        Add Customer
                      </strong>
                    </button>

                    <button
                      type="button"
                      onClick={openAddLead}
                      style={
                        styles.quickButton
                      }
                    >
                      <span>🎯</span>
                      <strong>Add Lead</strong>
                    </button>

                    <button
                      type="button"
                      onClick={openAddDeal}
                      style={
                        styles.quickButton
                      }
                    >
                      <span>💼</span>
                      <strong>Add Deal</strong>
                    </button>

                    <button
                      type="button"
                      onClick={openAddTask}
                      style={
                        styles.quickButton
                      }
                    >
                      <span>✅</span>
                      <strong>Add Task</strong>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {page === "Customers" && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Customers
                  </h2>

                  <p
                    style={styles.panelSubtitle}
                  >
                    Manage all your customers
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddCustomer}
                  style={styles.primaryButton}
                >
                  + Add Customer
                </button>
              </div>

              <div style={styles.toolbar}>
                <input
                  type="search"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) =>
                    setCustomerSearch(
                      e.target.value
                    )
                  }
                  style={{
                    ...styles.searchInput,
                    background: darkMode
                      ? "#0f172a"
                      : "#ffffff",
                    color: darkMode
                      ? "#f8fafc"
                      : "#0f172a",
                  }}
                />
              </div>

              {filteredCustomers.length ===
              0 ? (
                <EmptyState
                  icon="👥"
                  title="No customers found"
                  text={
                    customerSearch
                      ? "Try another search."
                      : "Add your first customer."
                  }
                  button={
                    customerSearch
                      ? null
                      : "+ Add Customer"
                  }
                  onClick={
                    customerSearch
                      ? null
                      : openAddCustomer
                  }
                />
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>
                          Customer
                        </th>
                        <th style={styles.th}>
                          Phone
                        </th>
                        <th style={styles.th}>
                          Email
                        </th>
                        <th style={styles.th}>
                          Company
                        </th>
                        <th style={styles.th}>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCustomers.map(
                        (customer) => (
                          <tr
                            key={customer._id}
                          >
                            <td
                              style={styles.td}
                            >
                              <div
                                style={
                                  styles.customerCell
                                }
                              >
                                <div
                                  style={
                                    styles.listAvatar
                                  }
                                >
                                  {(
                                    customer.name ||
                                    "C"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <strong>
                                  {
                                    customer.name
                                  }
                                </strong>
                              </div>
                            </td>

                            <td
                              style={styles.td}
                            >
                              {customer.phone ||
                                "—"}
                            </td>

                            <td
                              style={styles.td}
                            >
                              {customer.email ||
                                "—"}
                            </td>

                            <td
                              style={styles.td}
                            >
                              {customer.company ||
                                "—"}
                            </td>

                            <td
                              style={styles.td}
                            >
                              <div
                                style={
                                  styles.actionRow
                                }
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    openCommunication(
                                      customer
                                    )
                                  }
                                  style={
                                    styles.smallAction
                                  }
                                  title="Contact"
                                >
                                  💬
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditCustomer(
                                      customer
                                    )
                                  }
                                  style={
                                    styles.smallAction
                                  }
                                >
                                  ✏️
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteCustomer(
                                      customer._id
                                    )
                                  }
                                  style={{
                                    ...styles.smallAction,
                                    color:
                                      "#dc2626",
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {page === "Leads" && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Leads
                  </h2>

                  <p
                    style={styles.panelSubtitle}
                  >
                    Capture and manage leads from
                    Facebook, Instagram, WhatsApp,
                    Google and other sources.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddLead}
                  style={styles.primaryButton}
                >
                  + Add Lead
                </button>
              </div>

              <div style={styles.leadSummary}>
                <div style={styles.miniStat}>
                  <span>All Leads</span>
                  <strong>{leads.length}</strong>
                </div>

                <div style={styles.miniStat}>
                  <span>New</span>
                  <strong>{newLeads}</strong>
                </div>

                <div style={styles.miniStat}>
                  <span>Converted</span>
                  <strong>
                    {convertedLeads}
                  </strong>
                </div>
              </div>

              <div style={styles.toolbar}>
                <input
                  type="search"
                  placeholder="Search leads..."
                  value={leadSearch}
                  onChange={(e) =>
                    setLeadSearch(
                      e.target.value
                    )
                  }
                  style={{
                    ...styles.searchInput,
                    background: darkMode
                      ? "#0f172a"
                      : "#ffffff",
                    color: darkMode
                      ? "#f8fafc"
                      : "#0f172a",
                  }}
                />
              </div>

              {filteredLeads.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  title="No leads found"
                  text={
                    leadSearch
                      ? "Try another search."
                      : "Create a lead or connect an ad lead webhook later."
                  }
                  button={
                    leadSearch
                      ? null
                      : "+ Add Lead"
                  }
                  onClick={
                    leadSearch
                      ? null
                      : openAddLead
                  }
                />
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>
                          Lead
                        </th>
                        <th style={styles.th}>
                          Phone
                        </th>
                        <th style={styles.th}>
                          Source
                        </th>
                        <th style={styles.th}>
                          Status
                        </th>
                        <th style={styles.th}>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredLeads.map(
                        (lead) => (
                          <tr key={lead._id}>
                            <td style={styles.td}>
                              <div
                                style={
                                  styles.customerCell
                                }
                              >
                                <div
                                  style={
                                    styles.listAvatar
                                  }
                                >
                                  {(
                                    lead.name ||
                                    "L"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {lead.name}
                                  </strong>

                                  {lead.email && (
                                    <div
                                      style={
                                        styles.smallText
                                      }
                                    >
                                      {lead.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td style={styles.td}>
                              {lead.phone ||
                                "—"}
                            </td>

                            <td style={styles.td}>
                              <span
                                style={
                                  styles.sourceBadge
                                }
                              >
                                {lead.platform ||
                                  "Other"}
                              </span>
                            </td>

                            <td style={styles.td}>
                              <StatusBadge
                                status={
                                  lead.status
                                }
                              />
                            </td>

                            <td style={styles.td}>
                              <div
                                style={
                                  styles.actionRow
                                }
                              >
                                {!lead.convertedToCustomer &&
                                  lead.status !==
                                    "Converted" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        convertLead(
                                          lead
                                        )
                                      }
                                      disabled={
                                        leadLoading
                                      }
                                      style={
                                        styles.convertButton
                                      }
                                    >
                                      Convert
                                    </button>
                                  )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditLead(
                                      lead
                                    )
                                  }
                                  style={
                                    styles.smallAction
                                  }
                                >
                                  ✏️
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteLead(
                                      lead._id
                                    )
                                  }
                                  style={{
                                    ...styles.smallAction,
                                    color:
                                      "#dc2626",
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {page === "Deals" && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Deals
                  </h2>

                  <p
                    style={styles.panelSubtitle}
                  >
                    Manage sales opportunities.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddDeal}
                  style={styles.primaryButton}
                >
                  + Add Deal
                </button>
              </div>

              <div style={styles.toolbar}>
                <input
                  type="search"
                  placeholder="Search deals..."
                  value={dealSearch}
                  onChange={(e) =>
                    setDealSearch(
                      e.target.value
                    )
                  }
                  style={{
                    ...styles.searchInput,
                    background: darkMode
                      ? "#0f172a"
                      : "#ffffff",
                    color: darkMode
                      ? "#f8fafc"
                      : "#0f172a",
                  }}
                />
              </div>

              {filteredDeals.length === 0 ? (
                <EmptyState
                  icon="💼"
                  title="No deals found"
                  text="Create your first sales deal."
                  button="+ Add Deal"
                  onClick={openAddDeal}
                />
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>
                          Deal
                        </th>
                        <th style={styles.th}>
                          Customer
                        </th>
                        <th style={styles.th}>
                          Amount
                        </th>
                        <th style={styles.th}>
                          Status
                        </th>
                        <th style={styles.th}>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDeals.map(
                        (deal) => {
                          const customer =
                            deal.customerId &&
                            typeof deal.customerId ===
                              "object"
                              ? deal.customerId
                              : customers.find(
                                  (c) =>
                                    c._id ===
                                    deal.customerId
                                );

                          return (
                            <tr key={deal._id}>
                              <td
                                style={
                                  styles.td
                                }
                              >
                                <strong>
                                  {deal.title ||
                                    "Untitled Deal"}
                                </strong>

                                {deal.notes && (
                                  <div
                                    style={
                                      styles.smallText
                                    }
                                  >
                                    {deal.notes}
                                  </div>
                                )}
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                {customer?.name ||
                                  "—"}
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                ₹
                                {Number(
                                  deal.amount ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                <StatusBadge
                                  status={
                                    deal.status
                                  }
                                />
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                <div
                                  style={
                                    styles.actionRow
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditDeal(
                                        deal
                                      )
                                    }
                                    style={
                                      styles.smallAction
                                    }
                                  >
                                    ✏️
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteDeal(
                                        deal._id
                                      )
                                    }
                                    style={{
                                      ...styles.smallAction,
                                      color:
                                        "#dc2626",
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {page === "Tasks" && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Tasks
                  </h2>

                  <p
                    style={styles.panelSubtitle}
                  >
                    Manage follow-ups, work and
                    customer tasks.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddTask}
                  style={styles.primaryButton}
                >
                  + Add Task
                </button>
              </div>

              <div style={styles.taskSummary}>
                <div style={styles.miniStat}>
                  <span>All Tasks</span>
                  <strong>
                    {tasks.length}
                  </strong>
                </div>

                <div style={styles.miniStat}>
                  <span>Pending</span>
                  <strong>
                    {pendingTasks}
                  </strong>
                </div>

                <div style={styles.miniStat}>
                  <span>Completed</span>
                  <strong>
                    {completedTasks}
                  </strong>
                </div>
              </div>

              <div style={styles.toolbar}>
                <input
                  type="search"
                  placeholder="Search tasks..."
                  value={taskSearch}
                  onChange={(e) =>
                    setTaskSearch(
                      e.target.value
                    )
                  }
                  style={{
                    ...styles.searchInput,
                    background: darkMode
                      ? "#0f172a"
                      : "#ffffff",
                    color: darkMode
                      ? "#f8fafc"
                      : "#0f172a",
                  }}
                />
              </div>

              {filteredTasks.length === 0 ? (
                <EmptyState
                  icon="✅"
                  title="No tasks found"
                  text={
                    taskSearch
                      ? "Try another search."
                      : "Create your first task."
                  }
                  button={
                    taskSearch
                      ? null
                      : "+ Add Task"
                  }
                  onClick={
                    taskSearch
                      ? null
                      : openAddTask
                  }
                />
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>
                          Task
                        </th>

                        <th style={styles.th}>
                          Customer
                        </th>

                        <th style={styles.th}>
                          Priority
                        </th>

                        <th style={styles.th}>
                          Status
                        </th>

                        <th style={styles.th}>
                          Due Date
                        </th>

                        <th style={styles.th}>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTasks.map(
                        (task) => {
                          const customer =
                            task.customerId &&
                            typeof task.customerId ===
                              "object"
                              ? task.customerId
                              : customers.find(
                                  (c) =>
                                    c._id ===
                                    task.customerId
                                );

                          return (
                            <tr key={task._id}>
                              <td
                                style={
                                  styles.td
                                }
                              >
                                <strong>
                                  {task.title}
                                </strong>

                                {task.description && (
                                  <div
                                    style={
                                      styles.smallText
                                    }
                                  >
                                    {task.description}
                                  </div>
                                )}
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                {customer?.name ||
                                  "—"}
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                <PriorityBadge
                                  priority={
                                    task.priority
                                  }
                                />
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                <StatusBadge
                                  status={
                                    task.status
                                  }
                                />
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                {task.dueDate
                                  ? new Date(
                                      task.dueDate
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "—"}
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                <div
                                  style={
                                    styles.actionRow
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditTask(
                                        task
                                      )
                                    }
                                    style={
                                      styles.smallAction
                                    }
                                    title="Edit task"
                                  >
                                    ✏️
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteTask(
                                        task._id
                                      )
                                    }
                                    style={{
                                      ...styles.smallAction,
                                      color:
                                        "#dc2626",
                                    }}
                                    title="Delete task"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {page === "Reports" && (
            <div>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    👥
                  </div>

                  <div>
                    <div
                      style={styles.statLabel}
                    >
                      Customers
                    </div>

                    <div
                      style={styles.statValue}
                    >
                      {customers.length}
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    🎯
                  </div>

                  <div>
                    <div
                      style={styles.statLabel}
                    >
                      Leads
                    </div>

                    <div
                      style={styles.statValue}
                    >
                      {leads.length}
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    💼
                  </div>

                  <div>
                    <div
                      style={styles.statLabel}
                    >
                      Deals
                    </div>

                    <div
                      style={styles.statValue}
                    >
                      {deals.length}
                    </div>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    💰
                  </div>

                  <div>
                    <div
                      style={styles.statLabel}
                    >
                      Revenue
                    </div>

                    <div
                      style={styles.statValue}
                    >
                      ₹
                      {revenue.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.twoColumn}>
                <div style={styles.panel}>
                  <h3 style={styles.panelTitle}>
                    Lead Status
                  </h3>

                  <div style={styles.reportList}>
                    {LEAD_STATUSES.map(
                      (status) => {
                        const count =
                          leads.filter(
                            (lead) =>
                              lead.status ===
                              status
                          ).length;

                        return (
                          <div
                            key={status}
                            style={
                              styles.reportRow
                            }
                          >
                            <span>
                              {status}
                            </span>

                            <strong>
                              {count}
                            </strong>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                <div style={styles.panel}>
                  <h3 style={styles.panelTitle}>
                    Deal Status
                  </h3>

                  <div style={styles.reportList}>
                    {DEAL_STATUSES.map(
                      (status) => {
                        const count =
                          deals.filter(
                            (deal) =>
                              deal.status ===
                              status
                          ).length;

                        return (
                          <div
                            key={status}
                            style={
                              styles.reportRow
                            }
                          >
                            <span>
                              {status}
                            </span>

                            <strong>
                              {count}
                            </strong>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === "Settings" && (
            <div style={styles.twoColumn}>
              <div style={styles.panel}>
                <h2 style={styles.panelTitle}>
                  Account
                </h2>

                <div style={styles.settingRow}>
                  <div>
                    <strong>Login ID</strong>

                    <p
                      style={
                        styles.panelSubtitle
                      }
                    >
                      {currentUser?.name || "—"}
                    </p>
                  </div>
                </div>

                <div style={styles.settingRow}>
                  <div>
                    <strong>User ID</strong>

                    <p
                      style={
                        styles.panelSubtitle
                      }
                    >
                      {currentUser?.id || "—"}
                    </p>
                  </div>
                </div>

                <div style={styles.settingRow}>
                  <div>
                    <strong>API</strong>

                    <p
                      style={
                        styles.panelSubtitle
                      }
                    >
                      {API_URL}
                    </p>
                  </div>
                </div>
              </div>

              <div style={styles.panel}>
                <h2 style={styles.panelTitle}>
                  Preferences
                </h2>

                <div style={styles.settingRow}>
                  <div>
                    <strong>Dark Mode</strong>

                    <p
                      style={
                        styles.panelSubtitle
                      }
                    >
                      {darkMode
                        ? "Dark mode is ON"
                        : "Dark mode is OFF"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setDarkMode(!darkMode)
                    }
                    style={
                      darkMode
                        ? styles.primaryButton
                        : styles.secondaryButton
                    }
                  >
                    {darkMode ? "ON" : "OFF"}
                  </button>
                </div>

                <div style={styles.settingRow}>
                  <div>
                    <strong>
                      Database Customers
                    </strong>

                    <p
                      style={
                        styles.panelSubtitle
                      }
                    >
                      {customers.length} customers
                      loaded
                    </p>
                  </div>
                </div>

                <div style={styles.settingRow}>
                  <div>
                    <strong>
                      Database Leads
                    </strong>

                    <p
                      style={
                        styles.panelSubtitle
                      }
                    >
                      {leads.length} leads loaded
                    </p>
                  </div>
                </div>

                <div style={styles.settingRow}>
                  <div>
                    <strong>
                      Database Tasks
                    </strong>

                    <p
                      style={
                        styles.panelSubtitle
                      }
                    >
                      {tasks.length} tasks loaded
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {showCustomerModal && (
        <Modal
          title={
            editingCustomer
              ? "Edit Customer"
              : "Add Customer"
          }
          onClose={() =>
            setShowCustomerModal(false)
          }
        >
          <form onSubmit={saveCustomer}>
            <div style={styles.formGrid}>
              <FormInput
                label="Name *"
                value={customerForm.name}
                onChange={(value) =>
                  setCustomerForm({
                    ...customerForm,
                    name: value,
                  })
                }
                required
              />

              <FormInput
                label="Phone *"
                value={customerForm.phone}
                onChange={(value) =>
                  setCustomerForm({
                    ...customerForm,
                    phone: value,
                  })
                }
                required
              />

              <FormInput
                label="Email"
                type="email"
                value={customerForm.email}
                onChange={(value) =>
                  setCustomerForm({
                    ...customerForm,
                    email: value,
                  })
                }
              />

              <FormInput
                label="Company"
                value={customerForm.company}
                onChange={(value) =>
                  setCustomerForm({
                    ...customerForm,
                    company: value,
                  })
                }
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowCustomerModal(false)
                }
                style={
                  styles.secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingCustomer}
                style={styles.primaryButton}
              >
                {savingCustomer
                  ? "Saving..."
                  : editingCustomer
                  ? "Update Customer"
                  : "Save Customer"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showLeadModal && (
        <Modal
          title={
            editingLead
              ? "Edit Lead"
              : "Add Lead"
          }
          onClose={() =>
            setShowLeadModal(false)
          }
          width={650}
        >
          <form onSubmit={saveLead}>
            <div style={styles.formGrid}>
              <FormInput
                label="Name *"
                value={leadForm.name}
                onChange={(value) =>
                  setLeadForm({
                    ...leadForm,
                    name: value,
                  })
                }
                required
              />

              <FormInput
                label="Phone *"
                value={leadForm.phone}
                onChange={(value) =>
                  setLeadForm({
                    ...leadForm,
                    phone: value,
                  })
                }
                required
              />

              <FormInput
                label="Email"
                type="email"
                value={leadForm.email}
                onChange={(value) =>
                  setLeadForm({
                    ...leadForm,
                    email: value,
                  })
                }
              />

              <FormSelect
                label="Platform / Source"
                value={leadForm.platform}
                onChange={(value) =>
                  setLeadForm({
                    ...leadForm,
                    platform: value,
                  })
                }
                options={PLATFORMS}
              />

              <FormSelect
                label="Status"
                value={leadForm.status}
                onChange={(value) =>
                  setLeadForm({
                    ...leadForm,
                    status: value,
                  })
                }
                options={LEAD_STATUSES}
              />

              <FormInput
                label="External Lead ID"
                value={
                  leadForm.externalLeadId
                }
                onChange={(value) =>
                  setLeadForm({
                    ...leadForm,
                    externalLeadId: value,
                  })
                }
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Message
              </label>

              <textarea
                rows={4}
                value={leadForm.message}
                onChange={(e) =>
                  setLeadForm({
                    ...leadForm,
                    message: e.target.value,
                  })
                }
                placeholder="Lead message..."
                style={{
                  ...styles.input,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowLeadModal(false)
                }
                style={
                  styles.secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingLead}
                style={styles.primaryButton}
              >
                {savingLead
                  ? "Saving..."
                  : editingLead
                  ? "Update Lead"
                  : "Save Lead"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDealModal && (
        <Modal
          title={
            editingDeal
              ? "Edit Deal"
              : "Add Deal"
          }
          onClose={() =>
            setShowDealModal(false)
          }
        >
          <form onSubmit={saveDeal}>
            <div style={styles.formGrid}>
              <FormInput
                label="Deal Title *"
                value={dealForm.title}
                onChange={(value) =>
                  setDealForm({
                    ...dealForm,
                    title: value,
                  })
                }
                required
              />

              <FormSelect
                label="Customer"
                value={dealForm.customerId}
                onChange={(value) =>
                  setDealForm({
                    ...dealForm,
                    customerId: value,
                  })
                }
                options={[
                  {
                    value: "",
                    label: "No customer",
                  },
                  ...customers.map(
                    (customer) => ({
                      value: customer._id,
                      label: customer.name,
                    })
                  ),
                ]}
              />

              <FormInput
                label="Amount"
                type="number"
                value={dealForm.amount}
                onChange={(value) =>
                  setDealForm({
                    ...dealForm,
                    amount: value,
                  })
                }
              />

              <FormSelect
                label="Status"
                value={dealForm.status}
                onChange={(value) =>
                  setDealForm({
                    ...dealForm,
                    status: value,
                  })
                }
                options={DEAL_STATUSES}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Notes
              </label>

              <textarea
                rows={4}
                value={dealForm.notes}
                onChange={(e) =>
                  setDealForm({
                    ...dealForm,
                    notes: e.target.value,
                  })
                }
                style={{
                  ...styles.input,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowDealModal(false)
                }
                style={
                  styles.secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingDeal}
                style={styles.primaryButton}
              >
                {savingDeal
                  ? "Saving..."
                  : editingDeal
                  ? "Update Deal"
                  : "Save Deal"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showTaskModal && (
        <Modal
          title={
            editingTask
              ? "Edit Task"
              : "Add Task"
          }
          onClose={() =>
            setShowTaskModal(false)
          }
          width={650}
        >
          <form onSubmit={saveTask}>
            <div style={styles.formGrid}>
              <FormInput
                label="Task Title *"
                value={taskForm.title}
                onChange={(value) =>
                  setTaskForm({
                    ...taskForm,
                    title: value,
                  })
                }
                required
              />

              <FormSelect
                label="Customer"
                value={taskForm.customerId}
                onChange={(value) =>
                  setTaskForm({
                    ...taskForm,
                    customerId: value,
                  })
                }
                options={[
                  {
                    value: "",
                    label: "No customer",
                  },
                  ...customers.map(
                    (customer) => ({
                      value: customer._id,
                      label: customer.name,
                    })
                  ),
                ]}
              />

              <FormSelect
                label="Status"
                value={taskForm.status}
                onChange={(value) =>
                  setTaskForm({
                    ...taskForm,
                    status: value,
                  })
                }
                options={TASK_STATUSES}
              />

              <FormSelect
                label="Priority"
                value={taskForm.priority}
                onChange={(value) =>
                  setTaskForm({
                    ...taskForm,
                    priority: value,
                  })
                }
                options={TASK_PRIORITIES}
              />

              <FormInput
                label="Due Date"
                type="date"
                value={taskForm.dueDate}
                onChange={(value) =>
                  setTaskForm({
                    ...taskForm,
                    dueDate: value,
                  })
                }
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Description
              </label>

              <textarea
                rows={5}
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    description:
                      e.target.value,
                  })
                }
                placeholder="Task description..."
                style={{
                  ...styles.input,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowTaskModal(false)
                }
                style={
                  styles.secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingTask}
                style={styles.primaryButton}
              >
                {savingTask
                  ? "Saving..."
                  : editingTask
                  ? "Update Task"
                  : "Save Task"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showInteractionModal && (
        <Modal
          title="Add Interaction"
          onClose={() =>
            setShowInteractionModal(false)
          }
        >
          <form onSubmit={saveInteraction}>
            <FormSelect
              label="Customer"
              value={
                interactionForm.customerId
              }
              onChange={(value) =>
                setInteractionForm({
                  ...interactionForm,
                  customerId: value,
                })
              }
              options={[
                {
                  value: "",
                  label: "Select customer",
                },
                ...customers.map(
                  (customer) => ({
                    value: customer._id,
                    label: customer.name,
                  })
                ),
              ]}
            />

            <FormSelect
              label="Type"
              value={interactionForm.type}
              onChange={(value) =>
                setInteractionForm({
                  ...interactionForm,
                  type: value,
                })
              }
              options={[
                "Call",
                "WhatsApp",
                "SMS",
                "Email",
                "Meeting",
                "Other",
              ]}
            />

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Message
              </label>

              <textarea
                rows={5}
                value={
                  interactionForm.message
                }
                onChange={(e) =>
                  setInteractionForm({
                    ...interactionForm,
                    message:
                      e.target.value,
                  })
                }
                style={{
                  ...styles.input,
                  resize: "vertical",
                }}
                required
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowInteractionModal(
                    false
                  )
                }
                style={
                  styles.secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingInteraction}
                style={styles.primaryButton}
              >
                {savingInteraction
                  ? "Saving..."
                  : "Save Interaction"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showCommunicationModal &&
        communicationCustomer && (
          <Modal
            title="Contact Customer"
            onClose={() =>
              setShowCommunicationModal(
                false
              )
            }
          >
            <div style={styles.contactBox}>
              <div style={styles.listAvatar}>
                {(
                  communicationCustomer.name ||
                  "C"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {communicationCustomer.name}
                </strong>

                <div style={styles.smallText}>
                  {communicationCustomer.phone}
                </div>
              </div>
            </div>

            <FormSelect
              label="Communication"
              value={communicationType}
              onChange={setCommunicationType}
              options={[
                "WhatsApp",
                "Call",
                "SMS",
              ]}
            />

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowCommunicationModal(
                    false
                  )
                }
                style={
                  styles.secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={startCommunication}
                style={styles.primaryButton}
              >
                Continue
              </button>
            </div>
          </Modal>
        )}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={styles.input}
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options = [],
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={styles.input}
      >
        {options.map((option, index) => {
          const isObject =
            typeof option === "object";

          const optionValue = isObject
            ? option.value
            : option;

          const optionLabel = isObject
            ? option.label
            : option;

          return (
            <option
              key={`${optionValue}-${index}`}
              value={optionValue}
            >
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  button,
  onClick,
}) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>
        {icon}
      </div>

      <h3 style={{ margin: "0 0 7px" }}>
        {title}
      </h3>

      <p style={styles.emptyText}>
        {text}
      </p>

      {button && onClick && (
        <button
          type="button"
          onClick={onClick}
          style={styles.primaryButton}
        >
          {button}
        </button>
      )}
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    width: 245,
    minHeight: "100vh",
    borderRight: "1px solid",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    boxSizing: "border-box",
  },

  logo: {
    padding: "25px 20px",
    fontSize: 21,
    fontWeight: 800,
    borderBottom: "1px solid #e5e7eb",
  },

  nav: {
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },

  navButton: {
    border: "none",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
  },

  sidebarBottom: {
    marginTop: "auto",
    padding: 14,
  },

  userMini: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#4f46e5",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  logoutButton: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#be123c",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
  },

  main: {
    flex: 1,
    minWidth: 0,
  },

  topbar: {
    minHeight: 78,
    borderBottom: "1px solid",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px",
    boxSizing: "border-box",
  },

  pageTitle: {
    margin: 0,
    fontSize: 25,
    fontWeight: 800,
  },

  pageSubtitle: {
    margin: "4px 0 0",
    fontSize: 13,
  },

  topActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    fontSize: 18,
  },

  connectionBadge: {
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },

  content: {
    padding: 28,
    maxWidth: 1450,
    margin: "0 auto",
    boxSizing: "border-box",
  },

  welcomeCard: {
    background:
      "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#fff",
    borderRadius: 18,
    padding: 26,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 22,
  },

  welcomeEyebrow: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1.5,
    opacity: 0.8,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 16,
    marginBottom: 22,
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 15,
    padding: 19,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 21,
  },

  statLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 23,
    fontWeight: 800,
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
  },

  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    marginBottom: 18,
  },

  panelTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
  },

  panelSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 13,
  },

  primaryButton: {
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    borderRadius: 9,
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    borderRadius: 9,
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: 10,
  },

  quickButton: {
    minHeight: 90,
    border: "1px solid #e2e8f0",
    background: "#fff",
    borderRadius: 12,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    color: "#334155",
  },

  list: {
    display: "flex",
    flexDirection: "column",
  },

  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "11px 0",
    borderBottom:
      "1px solid #f1f5f9",
  },

  listAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },

  smallText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 3,
  },

  badge: {
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  sourceBadge: {
    display: "inline-block",
    padding: "5px 9px",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 700,
  },

  toolbar: {
    display: "flex",
    gap: 10,
    marginBottom: 18,
  },

  searchInput: {
    width: "100%",
    maxWidth: 430,
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    outline: "none",
    boxSizing: "border-box",
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 700,
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
    borderBottom:
      "1px solid #e2e8f0",
  },

  td: {
    padding: "13px 10px",
    borderBottom:
      "1px solid #f1f5f9",
    fontSize: 13,
  },

  customerCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },

  smallAction: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border:
      "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
  },

  convertButton: {
    border: "none",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 7,
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 800,
  },

  leadSummary: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 10,
    marginBottom: 18,
  },

  taskSummary: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 10,
    marginBottom: 18,
  },

  miniStat: {
    border:
      "1px solid #e2e8f0",
    borderRadius: 10,
    padding: 13,
    background: "#f8fafc",
  },

  reportList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 15,
  },

  reportRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 13px",
    background: "#f8fafc",
    borderRadius: 9,
  },

  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    padding: "15px 0",
    borderBottom:
      "1px solid #e2e8f0",
  },

  emptyState: {
    textAlign: "center",
    padding: "55px 20px",
    color: "#475569",
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyText: {
    color: "#64748b",
    maxWidth: 450,
    margin: "0 auto 18px",
    lineHeight: 1.5,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
    overflowY: "auto",
  },

  modal: {
    width: "100%",
    background: "#fff",
    borderRadius: 17,
    padding: 22,
    boxSizing: "border-box",
    maxHeight: "92vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
  },

  closeButton: {
    width: 35,
    height: 35,
    border: "none",
    borderRadius: 8,
    background: "#f1f5f9",
    cursor: "pointer",
    fontSize: 23,
    color: "#475569",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: 13,
  },

  formGroup: {
    marginBottom: 14,
  },

  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border:
      "1px solid #cbd5e1",
    borderRadius: 9,
    outline: "none",
    fontSize: 14,
    background: "#fff",
    color: "#0f172a",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 9,
    marginTop: 20,
  },

  contactBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    background: "#f8fafc",
    borderRadius: 11,
    marginBottom: 16,
  },

  globalError: {
    margin: "16px 28px 0",
    padding: "11px 14px",
    background: "#fee2e2",
    color: "#991b1b",
    border:
      "1px solid #fecaca",
    borderRadius: 9,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  errorClose: {
    border: "none",
    background: "transparent",
    color: "#991b1b",
    cursor: "pointer",
    fontSize: 18,
  },

  loadingBar: {
    margin: "12px 28px 0",
    padding: "8px 12px",
    background: "#eef2ff",
    color: "#4338ca",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },

  authPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef2ff, #f8fafc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    boxSizing: "border-box",
  },

  authCard: {
    width: "100%",
    maxWidth: 410,
    background: "#fff",
    borderRadius: 20,
    padding: 30,
    boxShadow:
      "0 20px 60px rgba(15, 23, 42, 0.12)",
    boxSizing: "border-box",
  },

  authLogo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 29,
    margin: "0 auto 13px",
  },

  authTitle: {
    textAlign: "center",
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
  },

  authSubtitle: {
    textAlign: "center",
    color: "#64748b",
    margin: "7px 0 25px",
  },

  errorBox: {
    padding: "10px 12px",
    background: "#fee2e2",
    color: "#991b1b",
    border:
      "1px solid #fecaca",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 15,
  },

  authSwitch: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 13,
    color: "#64748b",
  },

  linkButton: {
    border: "none",
    background: "transparent",
    color: "#4f46e5",
    fontWeight: 800,
    cursor: "pointer",
  },

  authNote: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 15,
  },
};
```