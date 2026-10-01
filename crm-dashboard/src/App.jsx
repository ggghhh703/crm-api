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

const LEAD_STATUSES = ["New", "Contacted", "Converted", "Closed"];
const TASK_STATUSES = ["Pending", "In Progress", "Completed"];
const PRIORITIES = ["Low", "Medium", "High"];

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

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      success: response.ok,
      message: text || "Invalid server response",
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

function getArray(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN");
}

function getCustomerName(customerId, customers) {
  if (!customerId) return "—";

  if (typeof customerId === "object") {
    return customerId.name || "—";
  }

  return (
    customers.find((customer) => customer._id === customerId)?.name || "—"
  );
}

function Modal({ title, onClose, children, width = 600 }) {
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

        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label}
        {required ? " *" : ""}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={styles.input}
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label}
        {required ? " *" : ""}
      </label>

      <select
        value={value}
        onChange={onChange}
        required={required}
        style={styles.input}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }) {
  let background = "#e2e8f0";
  let color = "#334155";

  if (
    status === "Completed" ||
    status === "Converted"
  ) {
    background = "#dcfce7";
    color = "#166534";
  }

  if (
    status === "In Progress" ||
    status === "Contacted"
  ) {
    background = "#dbeafe";
    color = "#1d4ed8";
  }

  if (status === "Pending" || status === "New") {
    background = "#fef3c7";
    color = "#92400e";
  }

  if (status === "Closed") {
    background = "#fee2e2";
    color = "#991b1b";
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
  let background = "#e2e8f0";
  let color = "#334155";

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

function EmptyState({ icon, title, text, button, onClick }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>{icon}</div>

      <h3 style={styles.emptyTitle}>{title}</h3>

      <p style={styles.emptyText}>{text}</p>

      {button && (
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

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await api(
        mode === "login" ? "/auth/login" : "/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            password,
          }),
        }
      );

      if (!data.token) {
        throw new Error("Authentication token was not received");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(data.user || { name: name.trim() })
      );

      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.authPage}>
      <div style={styles.authCard}>
        <div style={styles.logoCircle}>🚀</div>

        <h1 style={styles.authTitle}>CRM Pro</h1>

        <p style={styles.authSubtitle}>
          {mode === "login"
            ? "Login to your CRM"
            : "Create your CRM account"}
        </p>

        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        <form onSubmit={submit}>
          <FormInput
            label="ID"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your ID"
            required
          />

          <FormInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            type="password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.primaryButton,
              width: "100%",
              marginTop: 8,
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          style={styles.linkButton}
        >
          {mode === "login"
            ? "Create a new account"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem(THEME_KEY) === "true"
  );

  const [page, setPage] = useState("Dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [interactions, setInteractions] = useState([]);

  const [search, setSearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [dealSearch, setDealSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");

  const [showCustomerModal, setShowCustomerModal] =
    useState(false);

  const [showLeadModal, setShowLeadModal] =
    useState(false);

  const [showDealModal, setShowDealModal] =
    useState(false);

  const [showTaskModal, setShowTaskModal] =
    useState(false);

  const [showInteractionModal, setShowInteractionModal] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [editingLead, setEditingLead] =
    useState(null);

  const [editingDeal, setEditingDeal] =
    useState(null);

  const [editingTask, setEditingTask] =
    useState(null);

  const [editingInteraction, setEditingInteraction] =
    useState(null);

  const [saving, setSaving] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
  });

  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    platform: "Other",
    externalLeadId: "",
    status: "New",
  });

  const [dealForm, setDealForm] = useState({
    title: "",
    customerId: "",
    amount: "",
    stage: "New",
    status: "Open",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    customerId: "",
    status: "Pending",
    priority: "Medium",
    dueDate: "",
  });

  const [interactionForm, setInteractionForm] = useState({
    customerId: "",
    type: "Call",
    notes: "",
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token]);

  async function loadAll() {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api("/customers", {}, token),
        api("/leads", {}, token),
        api("/deals", {}, token),
        api("/tasks", {}, token),
        api("/interactions", {}, token),
      ]);

      const [
        customerResult,
        leadResult,
        dealResult,
        taskResult,
        interactionResult,
      ] = results;

      if (customerResult.status === "fulfilled") {
        setCustomers(
          getArray(customerResult.value, "customers")
        );
      }

      if (leadResult.status === "fulfilled") {
        setLeads(getArray(leadResult.value, "leads"));
      }

      if (dealResult.status === "fulfilled") {
        setDeals(getArray(dealResult.value, "deals"));
      }

      if (taskResult.status === "fulfilled") {
        setTasks(getArray(taskResult.value, "tasks"));
      }

      if (interactionResult.status === "fulfilled") {
        setInteractions(
          getArray(
            interactionResult.value,
            "interactions"
          )
        );
      }

      const rejected = results.find(
        (item) => item.status === "rejected"
      );

      if (rejected) {
        setError(rejected.reason?.message || "");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken("");
    setUser(null);
    setCustomers([]);
    setLeads([]);
    setDeals([]);
    setTasks([]);
    setInteractions([]);
  }

  function openAddCustomer() {
    setEditingCustomer(null);

    setCustomerForm({
      name: "",
      phone: "",
      email: "",
      company: "",
    });

    setShowCustomerModal(true);
  }

  function openEditCustomer(customer) {
    setEditingCustomer(customer);

    setCustomerForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      company: customer.company || "",
    });

    setShowCustomerModal(true);
  }

  async function saveCustomer(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim(),
        email: customerForm.email.trim(),
        company: customerForm.company.trim(),
      };

      if (!payload.name || !payload.phone) {
        throw new Error(
          "Customer name and phone are required"
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

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(id) {
    if (!window.confirm("Delete this customer?")) {
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
      name: "",
      phone: "",
      email: "",
      message: "",
      platform: "Other",
      externalLeadId: "",
      status: "New",
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
      externalLeadId: lead.externalLeadId || "",
      status: lead.status || "New",
    });

    setShowLeadModal(true);
  }

  async function saveLead(e) {
    e.preventDefault();

    setSaving(true);
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

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteLead(id) {
    if (!window.confirm("Delete this lead?")) {
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
    if (
      !window.confirm(
        `Convert "${lead.name}" into a customer?`
      )
    ) {
      return;
    }

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
    }
  }

  function openAddDeal() {
    setEditingDeal(null);

    setDealForm({
      title: "",
      customerId: "",
      amount: "",
      stage: "New",
      status: "Open",
    });

    setShowDealModal(true);
  }

  function openEditDeal(deal) {
    setEditingDeal(deal);

    setDealForm({
      title: deal.title || deal.name || "",
      customerId:
        typeof deal.customerId === "object"
          ? deal.customerId?._id || ""
          : deal.customerId || "",
      amount:
        deal.amount !== undefined && deal.amount !== null
          ? String(deal.amount)
          : "",
      stage: deal.stage || "New",
      status: deal.status || "Open",
    });

    setShowDealModal(true);
  }

  async function saveDeal(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: dealForm.title.trim(),
        customerId: dealForm.customerId || null,
        amount: Number(dealForm.amount || 0),
        stage: dealForm.stage,
        status: dealForm.status,
      };

      if (!payload.title) {
        throw new Error("Deal title is required");
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

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteDeal(id) {
    if (!window.confirm("Delete this deal?")) {
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
      title: "",
      description: "",
      customerId: "",
      status: "Pending",
      priority: "Medium",
      dueDate: "",
    });

    setShowTaskModal(true);
  }

  function openEditTask(task) {
    setEditingTask(task);

    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      customerId:
        typeof task.customerId === "object"
          ? task.customerId?._id || ""
          : task.customerId || "",
      status: task.status || "Pending",
      priority: task.priority || "Medium",
      dueDate: task.dueDate
        ? new Date(task.dueDate)
            .toISOString()
            .slice(0, 10)
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
        description: taskForm.description.trim(),
        customerId: taskForm.customerId || null,
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null,
      };

      if (!payload.title) {
        throw new Error("Task title is required");
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

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTask(false);
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) {
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

  function openAddInteraction() {
    setEditingInteraction(null);

    setInteractionForm({
      customerId: "",
      type: "Call",
      notes: "",
    });

    setShowInteractionModal(true);
  }

  function openEditInteraction(interaction) {
    setEditingInteraction(interaction);

    setInteractionForm({
      customerId:
        typeof interaction.customerId === "object"
          ? interaction.customerId?._id || ""
          : interaction.customerId || "",
      type: interaction.type || "Call",
      notes: interaction.notes || "",
    });

    setShowInteractionModal(true);
  }

  async function saveInteraction(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        customerId: interactionForm.customerId || null,
        type: interactionForm.type,
        notes: interactionForm.notes.trim(),
      };

      if (!payload.customerId) {
        throw new Error("Please select a customer");
      }

      if (editingInteraction) {
        await api(
          `/interactions/${editingInteraction._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          token
        );
      } else {
        await api(
          "/interactions",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          token
        );
      }

      setShowInteractionModal(false);
      setEditingInteraction(null);

      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteInteraction(id) {
    if (!window.confirm("Delete this interaction?")) {
      return;
    }

    try {
      await api(
        `/interactions/${id}`,
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

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.email,
        customer.company,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [customers, search]);

  const filteredLeads = useMemo(() => {
    const q = leadSearch.trim().toLowerCase();

    if (!q) return leads;

    return leads.filter((lead) =>
      [
        lead.name,
        lead.phone,
        lead.email,
        lead.platform,
        lead.status,
        lead.message,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [leads, leadSearch]);

  const filteredDeals = useMemo(() => {
    const q = dealSearch.trim().toLowerCase();

    if (!q) return deals;

    return deals.filter((deal) =>
      [
        deal.title,
        deal.name,
        deal.stage,
        deal.status,
        getCustomerName(deal.customerId, customers),
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [deals, dealSearch, customers]);

  const filteredTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();

    if (!q) return tasks;

    return tasks.filter((task) =>
      [
        task.title,
        task.description,
        task.status,
        task.priority,
        getCustomerName(task.customerId, customers),
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [tasks, taskSearch, customers]);

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const newLeads = leads.filter(
    (lead) => lead.status === "New"
  ).length;

  const convertedLeads = leads.filter(
    (lead) => lead.status === "Converted"
  ).length;

  const totalRevenue = deals.reduce(
    (sum, deal) =>
      sum + Number(deal.amount || deal.value || 0),
    0
  );

  if (!token) {
    return (
      <AuthScreen
        onLogin={(newToken, newUser) => {
          setToken(newToken);
          setUser(newUser);
        }}
      />
    );
  }

  const menu = [
    ["Dashboard", "🏠"],
    ["Customers", "👥"],
    ["Leads", "🎯"],
    ["Deals", "💼"],
    ["Tasks", "✅"],
    ["Interactions", "💬"],
    ["Reports", "📊"],
    ["Settings", "⚙️"],
  ];

  return (
    <div
      style={{
        ...styles.app,
        background: darkMode ? "#020617" : "#f8fafc",
        color: darkMode ? "#f8fafc" : "#0f172a",
      }}
    >
      <aside
        style={{
          ...styles.sidebar,
          background: darkMode ? "#0f172a" : "#ffffff",
          borderColor: darkMode ? "#1e293b" : "#e2e8f0",
        }}
      >
        <div style={styles.brand}>
          <span style={styles.brandIcon}>🚀</span>
          <span>CRM Pro</span>
        </div>

        <div style={styles.userBox}>
          <div style={styles.userAvatar}>
            {(user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div style={{ minWidth: 0 }}>
            <strong style={styles.userName}>
              {user?.name || "User"}
            </strong>
            <span style={styles.userRole}>CRM Account</span>
          </div>
        </div>

        <nav style={styles.nav}>
          {menu.map(([name, icon]) => (
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
                      : "#eff6ff"
                    : "transparent",
                color:
                  page === name
                    ? "#2563eb"
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
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            style={styles.navButton}
          >
            <span>{darkMode ? "☀️" : "🌙"}</span>
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            type="button"
            onClick={logout}
            style={{
              ...styles.navButton,
              color: "#dc2626",
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header
          style={{
            ...styles.topbar,
            background: darkMode ? "#0f172a" : "#ffffff",
            borderColor: darkMode ? "#1e293b" : "#e2e8f0",
          }}
        >
          <div>
            <h1 style={styles.pageHeading}>
              {page}
            </h1>

            <p style={styles.pageSubheading}>
              Manage your CRM from one place.
            </p>
          </div>

          <div style={styles.topActions}>
            {loading && (
              <span style={styles.loadingText}>
                Loading...
              </span>
            )}

            <button
              type="button"
              onClick={loadAll}
              style={styles.refreshButton}
            >
              🔄 Refresh
            </button>
          </div>
        </header>

        <div style={styles.content}>
          {error && (
            <div style={styles.errorBox}>
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

          {page === "Dashboard" && (
            <>
              <div style={styles.welcome}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Welcome back, {user?.name || "User"} 👋
                  </h2>

                  <p style={styles.panelSubtitle}>
                    Here is your CRM overview.
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

              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <span style={styles.statIcon}>👥</span>
                  <div>
                    <span style={styles.statLabel}>
                      Total Customers
                    </span>
                    <strong style={styles.statValue}>
                      {customers.length}
                    </strong>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <span style={styles.statIcon}>🎯</span>
                  <div>
                    <span style={styles.statLabel}>
                      New Leads
                    </span>
                    <strong style={styles.statValue}>
                      {newLeads}
                    </strong>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <span style={styles.statIcon}>💼</span>
                  <div>
                    <span style={styles.statLabel}>
                      Deals
                    </span>
                    <strong style={styles.statValue}>
                      {deals.length}
                    </strong>
                  </div>
                </div>

                <div style={styles.statCard}>
                  <span style={styles.statIcon}>₹</span>
                  <div>
                    <span style={styles.statLabel}>
                      Revenue
                    </span>
                    <strong style={styles.statValue}>
                      ₹{totalRevenue.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={styles.twoColumns}>
                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <div>
                      <h2 style={styles.panelTitle}>
                        Recent Customers
                      </h2>
                      <p style={styles.panelSubtitle}>
                        Latest customers added to CRM.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPage("Customers")}
                      style={styles.secondaryButton}
                    >
                      View All
                    </button>
                  </div>

                  {customers.length === 0 ? (
                    <EmptyState
                      icon="👥"
                      title="No customers yet"
                      text="Add your first customer."
                      button="+ Add Customer"
                      onClick={openAddCustomer}
                    />
                  ) : (
                    <div style={styles.simpleList}>
                      {customers.slice(0, 5).map((customer) => (
                        <div
                          key={customer._id}
                          style={styles.listRow}
                        >
                          <div style={styles.avatar}>
                            {(customer.name || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div style={{ flex: 1 }}>
                            <strong>{customer.name}</strong>
                            <span style={styles.smallText}>
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <div>
                      <h2 style={styles.panelTitle}>
                        Task Overview
                      </h2>
                      <p style={styles.panelSubtitle}>
                        Current task status.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPage("Tasks")}
                      style={styles.secondaryButton}
                    >
                      View Tasks
                    </button>
                  </div>

                  <div style={styles.overviewGrid}>
                    <div style={styles.overviewItem}>
                      <span>All Tasks</span>
                      <strong>{tasks.length}</strong>
                    </div>

                    <div style={styles.overviewItem}>
                      <span>Pending</span>
                      <strong>{pendingTasks}</strong>
                    </div>

                    <div style={styles.overviewItem}>
                      <span>Completed</span>
                      <strong>{completedTasks}</strong>
                    </div>
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

                  <p style={styles.panelSubtitle}>
                    Manage your customers and their details.
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              {filteredCustomers.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="No customers found"
                  text={
                    search
                      ? "Try another search."
                      : "Create your first customer."
                  }
                  button={search ? null : "+ Add Customer"}
                  onClick={
                    search ? null : openAddCustomer
                  }
                />
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Phone</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Company</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer._id}>
                          <td style={styles.td}>
                            <strong>{customer.name}</strong>
                          </td>

                          <td style={styles.td}>
                            {customer.phone || "—"}
                          </td>

                          <td style={styles.td}>
                            {customer.email || "—"}
                          </td>

                          <td style={styles.td}>
                            {customer.company || "—"}
                          </td>

                          <td style={styles.td}>
                            <div style={styles.actionRow}>
                              <button
                                type="button"
                                onClick={() =>
                                  openEditCustomer(customer)
                                }
                                style={styles.smallAction}
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteCustomer(customer._id)
                                }
                                style={{
                                  ...styles.smallAction,
                                  color: "#dc2626",
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

                  <p style={styles.panelSubtitle}>
                    Manage leads from ads and other sources.
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

              <div style={styles.statsGridSmall}>
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
                  <strong>{convertedLeads}</strong>
                </div>
              </div>

              <div style={styles.toolbar}>
                <input
                  type="search"
                  placeholder="Search leads..."
                  value={leadSearch}
                  onChange={(e) =>
                    setLeadSearch(e.target.value)
                  }
                  style={styles.searchInput}
                />
              </div>

              {filteredLeads.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  title="No leads found"
                  text={
                    leadSearch
                      ? "Try another search."
                      : "Add your first lead."
                  }
                  button={
                    leadSearch ? null : "+ Add Lead"
                  }
                  onClick={
                    leadSearch ? null : openAddLead
                  }
                />
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Lead</th>
                        <th style={styles.th}>Phone</th>
                        <th style={styles.th}>Platform</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr key={lead._id}>
                          <td style={styles.td}>
                            <strong>{lead.name}</strong>

                            {lead.email && (
                              <div style={styles.smallText}>
                                {lead.email}
                              </div>
                            )}
                          </td>

                          <td style={styles.td}>
                            {lead.phone}
                          </td>

                          <td style={styles.td}>
                            <span style={styles.badge}>
                              {lead.platform || "Other"}
                            </span>
                          </td>

                          <td style={styles.td}>
                            <StatusBadge
                              status={lead.status}
                            />
                          </td>

                          <td style={styles.td}>
                            <div style={styles.actionRow}>
                              {lead.status !==
                                "Converted" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    convertLead(lead)
                                  }
                                  style={styles.smallAction}
                                  title="Convert to customer"
                                >
                                  ➡️
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  openEditLead(lead)
                                }
                                style={styles.smallAction}
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteLead(lead._id)
                                }
                                style={{
                                  ...styles.smallAction,
                                  color: "#dc2626",
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

                  <p style={styles.panelSubtitle}>
                    Manage your sales opportunities.
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
                    setDealSearch(e.target.value)
                  }
                  style={styles.searchInput}
                />
              </div>

              {filteredDeals.length === 0 ? (
                <EmptyState
                  icon="💼"
                  title="No deals found"
                  text={
                    dealSearch
                      ? "Try another search."
                      : "Create your first deal."
                  }
                  button={
                    dealSearch ? null : "+ Add Deal"
                  }
                  onClick={
                    dealSearch ? null : openAddDeal
                  }
                />
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Deal</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Stage</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDeals.map((deal) => (
                        <tr key={deal._id}>
                          <td style={styles.td}>
                            <strong>
                              {deal.title ||
                                deal.name ||
                                "Untitled Deal"}
                            </strong>
                          </td>

                          <td style={styles.td}>
                            {getCustomerName(
                              deal.customerId,
                              customers
                            )}
                          </td>

                          <td style={styles.td}>
                            ₹
                            {Number(
                              deal.amount ||
                                deal.value ||
                                0
                            ).toLocaleString("en-IN")}
                          </td>

                          <td style={styles.td}>
                            {deal.stage || "—"}
                          </td>

                          <td style={styles.td}>
                            <StatusBadge
                              status={deal.status || "Open"}
                            />
                          </td>

                          <td style={styles.td}>
                            <div style={styles.actionRow}>
                              <button
                                type="button"
                                onClick={() =>
                                  openEditDeal(deal)
                                }
                                style={styles.smallAction}
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteDeal(deal._id)
                                }
                                style={{
                                  ...styles.smallAction,
                                  color: "#dc2626",
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

                  <p style={styles.panelSubtitle}>
                    Manage follow-ups, work and customer tasks.
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

              <div style={styles.statsGridSmall}>
                <div style={styles.miniStat}>
                  <span>All Tasks</span>
                  <strong>{tasks.length}</strong>
                </div>

                <div style={styles.miniStat}>
                  <span>Pending</span>
                  <strong>{pendingTasks}</strong>
                </div>

                <div style={styles.miniStat}>
                  <span>Completed</span>
                  <strong>{completedTasks}</strong>
                </div>
              </div>

              <div style={styles.toolbar}>
                <input
                  type="search"
                  placeholder="Search tasks..."
                  value={taskSearch}
                  onChange={(e) =>
                    setTaskSearch(e.target.value)
                  }
                  style={styles.searchInput}
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
                    taskSearch ? null : "+ Add Task"
                  }
                  onClick={
                    taskSearch ? null : openAddTask
                  }
                />
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Task</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Priority</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Due Date</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTasks.map((task) => (
                        <tr key={task._id}>
                          <td style={styles.td}>
                            <strong>{task.title}</strong>

                            {task.description && (
                              <div style={styles.smallText}>
                                {task.description}
                              </div>
                            )}
                          </td>

                          <td style={styles.td}>
                            {getCustomerName(
                              task.customerId,
                              customers
                            )}
                          </td>

                          <td style={styles.td}>
                            <PriorityBadge
                              priority={task.priority}
                            />
                          </td>

                          <td style={styles.td}>
                            <StatusBadge
                              status={task.status}
                            />
                          </td>

                          <td style={styles.td}>
                            {formatDate(task.dueDate)}
                          </td>

                          <td style={styles.td}>
                            <div style={styles.actionRow}>
                              <button
                                type="button"
                                onClick={() =>
                                  openEditTask(task)
                                }
                                style={styles.smallAction}
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteTask(task._id)
                                }
                                style={{
                                  ...styles.smallAction,
                                  color: "#dc2626",
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {page === "Interactions" && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Interactions
                  </h2>

                  <p style={styles.panelSubtitle}>
                    Track calls, meetings and customer communication.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddInteraction}
                  style={styles.primaryButton}
                >
                  + Add Interaction
                </button>
              </div>

              {interactions.length === 0 ? (
                <EmptyState
                  icon="💬"
                  title="No interactions found"
                  text="Record your first customer interaction."
                  button="+ Add Interaction"
                  onClick={openAddInteraction}
                />
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Notes</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {interactions.map((interaction) => (
                        <tr key={interaction._id}>
                          <td style={styles.td}>
                            {getCustomerName(
                              interaction.customerId,
                              customers
                            )}
                          </td>

                          <td style={styles.td}>
                            {interaction.type || "—"}
                          </td>

                          <td style={styles.td}>
                            {interaction.notes || "—"}
                          </td>

                          <td style={styles.td}>
                            {formatDate(
                              interaction.createdAt
                            )}
                          </td>

                          <td style={styles.td}>
                            <div style={styles.actionRow}>
                              <button
                                type="button"
                                onClick={() =>
                                  openEditInteraction(
                                    interaction
                                  )
                                }
                                style={styles.smallAction}
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteInteraction(
                                    interaction._id
                                  )
                                }
                                style={{
                                  ...styles.smallAction,
                                  color: "#dc2626",
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {page === "Reports" && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Reports
                  </h2>

                  <p style={styles.panelSubtitle}>
                    CRM activity summary.
                  </p>
                </div>
              </div>

              <div style={styles.reportGrid}>
                <div style={styles.reportCard}>
                  <span>Customers</span>
                  <strong>{customers.length}</strong>
                </div>

                <div style={styles.reportCard}>
                  <span>Leads</span>
                  <strong>{leads.length}</strong>
                </div>

                <div style={styles.reportCard}>
                  <span>Deals</span>
                  <strong>{deals.length}</strong>
                </div>

                <div style={styles.reportCard}>
                  <span>Tasks</span>
                  <strong>{tasks.length}</strong>
                </div>

                <div style={styles.reportCard}>
                  <span>Interactions</span>
                  <strong>{interactions.length}</strong>
                </div>

                <div style={styles.reportCard}>
                  <span>Revenue</span>
                  <strong>
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {page === "Settings" && (
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Settings
                  </h2>

                  <p style={styles.panelSubtitle}>
                    Manage your CRM preferences.
                  </p>
                </div>
              </div>

              <div style={styles.settingsList}>
                <div style={styles.settingRow}>
                  <div>
                    <strong>Dark Mode</strong>
                    <p style={styles.smallText}>
                      Change the CRM appearance.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setDarkMode(!darkMode)
                    }
                    style={{
                      ...styles.toggle,
                      background: darkMode
                        ? "#2563eb"
                        : "#cbd5e1",
                    }}
                  >
                    <span
                      style={{
                        ...styles.toggleDot,
                        transform: darkMode
                          ? "translateX(20px)"
                          : "translateX(0)",
                      }}
                    />
                  </button>
                </div>

                <div style={styles.settingRow}>
                  <div>
                    <strong>Backend</strong>
                    <p style={styles.smallText}>
                      {API_URL}
                    </p>
                  </div>

                  <span style={styles.onlineBadge}>
                    ● Connected
                  </span>
                </div>

                <div style={styles.settingRow}>
                  <div>
                    <strong>Database Records</strong>
                    <p style={styles.smallText}>
                      Customers, leads, deals and tasks
                    </p>
                  </div>

                  <strong>
                    {customers.length +
                      leads.length +
                      deals.length +
                      tasks.length}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCustomerModal && (
        <Modal
          title={
            editingCustomer
              ? "Edit Customer"
              : "Add Customer"
          }
          onClose={() => {
            setShowCustomerModal(false);
            setEditingCustomer(null);
          }}
        >
          <form onSubmit={saveCustomer}>
            <FormInput
              label="Name"
              value={customerForm.name}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  name: e.target.value,
                })
              }
              placeholder="Customer name"
              required
            />

            <FormInput
              label="Phone"
              value={customerForm.phone}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  phone: e.target.value,
                })
              }
              placeholder="Phone number"
              required
            />

            <FormInput
              label="Email"
              value={customerForm.email}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  email: e.target.value,
                })
              }
              placeholder="Email address"
              type="email"
            />

            <FormInput
              label="Company"
              value={customerForm.company}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  company: e.target.value,
                })
              }
              placeholder="Company name"
            />

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowCustomerModal(false)
                }
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={styles.primaryButton}
              >
                {saving
                  ? "Saving..."
                  : editingCustomer
                  ? "Update Customer"
                  : "Create Customer"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showLeadModal && (
        <Modal
          title={
            editingLead ? "Edit Lead" : "Add Lead"
          }
          onClose={() => {
            setShowLeadModal(false);
            setEditingLead(null);
          }}
        >
          <form onSubmit={saveLead}>
            <FormInput
              label="Name"
              value={leadForm.name}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  name: e.target.value,
                })
              }
              placeholder="Lead name"
              required
            />

            <FormInput
              label="Phone"
              value={leadForm.phone}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  phone: e.target.value,
                })
              }
              placeholder="Phone number"
              required
            />

            <FormInput
              label="Email"
              value={leadForm.email}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  email: e.target.value,
                })
              }
              placeholder="Email"
              type="email"
            />

            <FormSelect
              label="Platform"
              value={leadForm.platform}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  platform: e.target.value,
                })
              }
              options={PLATFORMS}
            />

            <FormInput
              label="External Lead ID"
              value={leadForm.externalLeadId}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  externalLeadId: e.target.value,
                })
              }
              placeholder="Optional"
            />

            <FormSelect
              label="Status"
              value={leadForm.status}
              onChange={(e) =>
                setLeadForm({
                  ...leadForm,
                  status: e.target.value,
                })
              }
              options={LEAD_STATUSES}
            />

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Message
              </label>

              <textarea
                value={leadForm.message}
                onChange={(e) =>
                  setLeadForm({
                    ...leadForm,
                    message: e.target.value,
                  })
                }
                rows={4}
                placeholder="Lead message"
                style={styles.textarea}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowLeadModal(false)
                }
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={styles.primaryButton}
              >
                {saving
                  ? "Saving..."
                  : editingLead
                  ? "Update Lead"
                  : "Create Lead"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDealModal && (
        <Modal
          title={
            editingDeal ? "Edit Deal" : "Add Deal"
          }
          onClose={() => {
            setShowDealModal(false);
            setEditingDeal(null);
          }}
        >
          <form onSubmit={saveDeal}>
            <FormInput
              label="Deal Title"
              value={dealForm.title}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  title: e.target.value,
                })
              }
              placeholder="Deal title"
              required
            />

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Customer
              </label>

              <select
                value={dealForm.customerId}
                onChange={(e) =>
                  setDealForm({
                    ...dealForm,
                    customerId: e.target.value,
                  })
                }
                style={styles.input}
              >
                <option value="">
                  No customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer._id}
                    value={customer._id}
                  >
                    {customer.name}
                    {customer.phone
                      ? ` — ${customer.phone}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Amount"
              value={dealForm.amount}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  amount: e.target.value,
                })
              }
              placeholder="0"
              type="number"
            />

            <FormSelect
              label="Stage"
              value={dealForm.stage}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  stage: e.target.value,
                })
              }
              options={[
                "New",
                "Qualified",
                "Proposal",
                "Negotiation",
                "Won",
                "Lost",
              ]}
            />

            <FormSelect
              label="Status"
              value={dealForm.status}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  status: e.target.value,
                })
              }
              options={[
                "Open",
                "Won",
                "Lost",
                "Closed",
              ]}
            />

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowDealModal(false)
                }
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={styles.primaryButton}
              >
                {saving
                  ? "Saving..."
                  : editingDeal
                  ? "Update Deal"
                  : "Create Deal"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showTaskModal && (
        <Modal
          title={
            editingTask ? "Edit Task" : "Add Task"
          }
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        >
          <form onSubmit={saveTask}>
            <FormInput
              label="Task Title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  title: e.target.value,
                })
              }
              placeholder="Enter task title"
              required
            />

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Description
              </label>

              <textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    description: e.target.value,
                  })
                }
                rows={4}
                placeholder="Enter task description"
                style={styles.textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Customer
              </label>

              <select
                value={taskForm.customerId}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    customerId: e.target.value,
                  })
                }
                style={styles.input}
              >
                <option value="">
                  No customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer._id}
                    value={customer._id}
                  >
                    {customer.name}
                    {customer.phone
                      ? ` — ${customer.phone}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <FormSelect
              label="Status"
              value={taskForm.status}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  status: e.target.value,
                })
              }
              options={TASK_STATUSES}
            />

            <FormSelect
              label="Priority"
              value={taskForm.priority}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  priority: e.target.value,
                })
              }
              options={PRIORITIES}
            />

            <FormInput
              label="Due Date"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  dueDate: e.target.value,
                })
              }
            />

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowTaskModal(false)
                }
                style={styles.secondaryButton}
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
                  : "Create Task"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showInteractionModal && (
        <Modal
          title={
            editingInteraction
              ? "Edit Interaction"
              : "Add Interaction"
          }
          onClose={() => {
            setShowInteractionModal(false);
            setEditingInteraction(null);
          }}
        >
          <form onSubmit={saveInteraction}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Customer
              </label>

              <select
                value={interactionForm.customerId}
                onChange={(e) =>
                  setInteractionForm({
                    ...interactionForm,
                    customerId: e.target.value,
                  })
                }
                style={styles.input}
                required
              >
                <option value="">
                  Select customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer._id}
                    value={customer._id}
                  >
                    {customer.name}
                    {customer.phone
                      ? ` — ${customer.phone}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <FormSelect
              label="Type"
              value={interactionForm.type}
              onChange={(e) =>
                setInteractionForm({
                  ...interactionForm,
                  type: e.target.value,
                })
              }
              options={[
                "Call",
                "WhatsApp",
                "Email",
                "Meeting",
                "Note",
                "Other",
              ]}
            />

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Notes
              </label>

              <textarea
                value={interactionForm.notes}
                onChange={(e) =>
                  setInteractionForm({
                    ...interactionForm,
                    notes: e.target.value,
                  })
                }
                rows={5}
                placeholder="Write interaction notes..."
                style={styles.textarea}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowInteractionModal(false)
                }
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={styles.primaryButton}
              >
                {saving
                  ? "Saving..."
                  : editingInteraction
                  ? "Update Interaction"
                  : "Save Interaction"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  sidebar: {
    width: 250,
    minHeight: "100vh",
    borderRight: "1px solid",
    padding: 18,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 21,
    fontWeight: 800,
    marginBottom: 22,
  },

  brandIcon: {
    fontSize: 25,
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 8px",
    marginBottom: 15,
  },

  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  userName: {
    display: "block",
    fontSize: 14,
  },

  userRole: {
    display: "block",
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },

  navButton: {
    border: 0,
    background: "transparent",
    padding: "11px 12px",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    gap: 11,
    cursor: "pointer",
    fontSize: 14,
    textAlign: "left",
  },

  sidebarBottom: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },

  main: {
    flex: 1,
    minWidth: 0,
  },

  topbar: {
    minHeight: 76,
    borderBottom: "1px solid",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 25px",
    boxSizing: "border-box",
  },

  pageHeading: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
  },

  pageSubheading: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 13,
  },

  topActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  loadingText: {
    color: "#64748b",
    fontSize: 13,
  },

  refreshButton: {
    border: "1px solid #cbd5e1",
    background: "transparent",
    padding: "9px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },

  content: {
    padding: 25,
    maxWidth: 1500,
    margin: "0 auto",
  },

  welcome: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
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
    fontSize: 19,
    fontWeight: 800,
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 15,
    marginBottom: 20,
  },

  statsGridSmall: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 21,
    fontWeight: 800,
  },

  statLabel: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    marginBottom: 3,
  },

  statValue: {
    display: "block",
    fontSize: 22,
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
  },

  overviewGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 10,
  },

  overviewItem: {
    background: "#f8fafc",
    padding: 16,
    borderRadius: 10,
  },

  miniStat: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: 15,
  },

  simpleList: {
    display: "flex",
    flexDirection: "column",
  },

  listRow: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "11px 0",
    borderBottom: "1px solid #e2e8f0",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },

  toolbar: {
    marginBottom: 16,
  },

  searchInput: {
    width: "100%",
    maxWidth: 450,
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    outline: "none",
    boxSizing: "border-box",
    fontSize: 14,
    background: "#ffffff",
    color: "#0f172a",
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 750,
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: 12,
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 10px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 13,
    verticalAlign: "top",
  },

  smallText: {
    display: "block",
    color: "#64748b",
    fontSize: 11,
    marginTop: 3,
    lineHeight: 1.4,
  },

  actionRow: {
    display: "flex",
    gap: 5,
  },

  smallAction: {
    width: 34,
    height: 34,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    borderRadius: 7,
    cursor: "pointer",
  },

  primaryButton: {
    border: 0,
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 15px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    padding: "9px 13px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: "#f1f5f9",
    color: "#334155",
  },

  emptyState: {
    textAlign: "center",
    padding: "45px 20px",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },

  emptyTitle: {
    margin: 0,
    fontSize: 18,
  },

  emptyText: {
    color: "#64748b",
    fontSize: 13,
    margin: "7px 0 17px",
  },

  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 9,
    padding: "11px 13px",
    marginBottom: 15,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
  },

  errorClose: {
    border: 0,
    background: "transparent",
    color: "#991b1b",
    cursor: "pointer",
    fontSize: 18,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.58)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    zIndex: 1000,
    overflowY: "auto",
  },

  modal: {
    width: "100%",
    background: "#ffffff",
    borderRadius: 14,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    maxHeight: "92vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "17px 20px",
    borderBottom: "1px solid #e2e8f0",
  },

  modalTitle: {
    margin: 0,
    fontSize: 18,
  },

  closeButton: {
    width: 34,
    height: 34,
    border: 0,
    borderRadius: 8,
    background: "#f1f5f9",
    cursor: "pointer",
    fontSize: 23,
    color: "#475569",
  },

  modalBody: {
    padding: 20,
  },

  formGroup: {
    marginBottom: 15,
  },

  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    outline: "none",
    fontSize: 14,
    background: "#ffffff",
    color: "#0f172a",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    outline: "none",
    fontSize: 14,
    background: "#ffffff",
    color: "#0f172a",
    resize: "vertical",
    fontFamily: "inherit",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 9,
    marginTop: 20,
  },

  reportGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 15,
  },

  reportCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 18,
  },

  settingsList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    padding: 16,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
  },

  toggle: {
    width: 44,
    height: 24,
    border: 0,
    borderRadius: 999,
    padding: 2,
    cursor: "pointer",
    transition: "background 0.2s",
  },

  toggleDot: {
    display: "block",
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#ffffff",
    transition: "transform 0.2s",
  },

  onlineBadge: {
    color: "#166534",
    background: "#dcfce7",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  },

  authPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eff6ff, #f8fafc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    boxSizing: "border-box",
  },

  authCard: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 28,
    boxSizing: "border-box",
    boxShadow:
      "0 20px 50px rgba(15,23,42,0.10)",
  },

  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    margin: "0 auto 12px",
  },

  authTitle: {
    textAlign: "center",
    margin: 0,
    fontSize: 27,
  },

  authSubtitle: {
    textAlign: "center",
    color: "#64748b",
    margin: "6px 0 22px",
    fontSize: 13,
  },

  linkButton: {
    display: "block",
    margin: "18px auto 0",
    border: 0,
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: 13,
  },
};