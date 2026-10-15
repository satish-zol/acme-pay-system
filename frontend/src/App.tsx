import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SouthEastRoundedIcon from "@mui/icons-material/SouthEastRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { Analytics, Employee, EmployeeResponse, Pagination, SalaryGroup, request } from "./types";

const API = "/api/v1";
const currencyLocale: Record<string, string> = {
  AUD: "en-AU", CAD: "en-CA", CHF: "de-CH", EUR: "de-DE", GBP: "en-GB",
  INR: "en-IN", JPY: "ja-JP", SGD: "en-SG", USD: "en-US",
};

function formatMoney(value: number | string, currency: string, compact = false) {
  return new Intl.NumberFormat(currencyLocale[currency] ?? "en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    ...(compact ? { notation: "compact" as const } : {}),
  }).format(Number(value));
}

function MetricCard({
  label, value, detail, icon, tint = "#e9f1ec",
}: {
  label: string; value: string; detail: string; icon: React.ReactNode; tint?: string;
}) {
  return (
    <Card sx={{ flex: 1, minWidth: 210 }}>
      <CardContent sx={{ p: "20px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 1.1 }}>{value}</Typography>
          </Box>
          <Avatar sx={{ bgcolor: tint, color: "primary.main", width: 40, height: 40 }}>{icon}</Avatar>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1.2 }}>
          <SouthEastRoundedIcon sx={{ color: "success.main", fontSize: 14, transform: "rotate(180deg)" }} />
          <Typography variant="caption" color="text.secondary">{detail}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SalaryBreakdown({ groups }: { groups: SalaryGroup[] }) {
  if (!groups.length) {
    return <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>No compensation data available.</Typography>;
  }
  return (
    <TableContainer>
      <Table size="small" aria-label="Salary breakdown">
        <TableHead>
          <TableRow>
            <TableCell>Group</TableCell>
            <TableCell align="right">Employees</TableCell>
            <TableCell align="right">Average salary</TableCell>
            <TableCell align="right">Median</TableCell>
            <TableCell align="right">Range</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={`${group.country ?? group.department ?? group.currency}-${group.currency}`} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>{group.country ?? group.department ?? group.currency}</Typography>
                <Typography variant="caption" color="text.secondary">{group.currency} · annual</Typography>
              </TableCell>
              <TableCell align="right">{group.headcount.toLocaleString()}</TableCell>
              <TableCell align="right">{formatMoney(group.average_salary, group.currency)}</TableCell>
              <TableCell align="right">{formatMoney(group.median_salary, group.currency)}</TableCell>
              <TableCell align="right">
                {formatMoney(group.minimum_salary, group.currency, true)} – {formatMoney(group.maximum_salary, group.currency, true)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function EmployeeEditor({
  employee, onClose, onSaved,
}: {
  employee: Employee | null; onClose: () => void; onSaved: (updated: Employee) => void;
}) {
  const [salary, setSalary] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setSalary(String(Number(employee.annual_salary)));
      setCurrency(employee.currency);
      setError("");
    }
  }, [employee]);

  const save = async () => {
    if (!employee || salary.trim() === "" || !Number.isFinite(Number(salary)) || Number(salary) < 0) {
      setError("Enter a valid annual salary of zero or more.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await request<Employee>(`${API}/employees/${employee.id}`, {
        method: "PATCH",
        body: JSON.stringify({ employee: { annual_salary: salary, currency } }),
      });
      onSaved(updated);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Salary update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(employee)} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Update annual salary</DialogTitle>
      <DialogContent>
        {employee && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography fontWeight={600}>{employee.first_name} {employee.last_name}</Typography>
              <Typography variant="body2" color="text.secondary">{employee.employee_number} · {employee.job_title}</Typography>
            </Box>
            <TextField
              label="Annual salary"
              type="number"
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
              inputProps={{ min: 0, max: 100000000, step: 1000 }}
              InputProps={{ startAdornment: <InputAdornment position="start">{currency}</InputAdornment> }}
              autoFocus
            />
            <FormControl>
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select labelId="currency-label" label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>
                {["AUD", "CAD", "CHF", "EUR", "GBP", "INR", "JPY", "SGD", "USD"].map((code) => (
                  <MenuItem key={code} value={code}>{code}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">Cancel</Button>
        <Button onClick={save} variant="contained" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function App() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [notice, setNotice] = useState("");
  const [breakdown, setBreakdown] = useState<"currency" | "country" | "department">("currency");

  const currencyStats = useMemo(() => analytics?.compensation_by_currency ?? [], [analytics]);
  const breakdownGroups = breakdown === "country"
    ? analytics?.compensation_by_country ?? []
    : breakdown === "department"
      ? analytics?.compensation_by_department ?? []
      : currencyStats;

  const loadDashboard = useCallback(async () => {
    const [dashboard, filters] = await Promise.all([
      request<Analytics>(`${API}/analytics`),
      request<{ countries: string[]; departments: string[] }>(`${API}/filters`),
    ]);
    setAnalytics(dashboard);
    setCountries(filters.countries);
    setDepartments(filters.departments);
  }, []);

  useEffect(() => {
    loadDashboard().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Unable to load compensation overview.");
    });
  }, [loadDashboard]);

  useEffect(() => {
    const debounce = window.setTimeout(() => {
      setSearchTerm(query.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), sort });
    if (searchTerm) params.set("q", searchTerm);
    if (country) params.set("country", country);
    if (department) params.set("department", department);

    setLoading(true);
    setError("");
    request<EmployeeResponse>(`${API}/employees?${params}`, { signal: controller.signal })
      .then((result) => {
        setEmployees(result.employees);
        setPagination(result.pagination);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Unable to load employee records.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [country, department, page, searchTerm, sort]);

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const saveEmployee = (updated: Employee) => {
    setEmployees((rows) => rows.map((row) => row.id === updated.id ? updated : row));
    setNotice(`Salary updated for ${updated.first_name} ${updated.last_name}.`);
    loadDashboard().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Unable to refresh compensation overview.");
    });
  };

  const range = pagination?.total_count
    ? `${((page - 1) * (pagination?.per_page ?? 25)) + 1}–${Math.min(page * (pagination?.per_page ?? 25), pagination.total_count)}`
    : "0";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      <Box
        component="aside"
        sx={{
          width: 232, flexShrink: 0, bgcolor: "#20382f", color: "#fff",
          display: { xs: "none", md: "flex" }, flexDirection: "column", p: 2.5,
        }}
      >
        <Stack direction="row" spacing={1.3} alignItems="center" sx={{ mb: 6, mt: 0.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#d4e5d9", color: "#20382f", fontWeight: 800, fontSize: 14 }}>A</Avatar>
          <Box>
            <Typography fontWeight={700} letterSpacing=".05em">ACME</Typography>
            <Typography variant="caption" sx={{ color: "#b6c8bd" }}>PEOPLE OPERATIONS</Typography>
          </Box>
        </Stack>
        <Typography variant="overline" sx={{ color: "#95afa0", px: 1.2 }}>WORKSPACE</Typography>
        <Box sx={{ mt: 1, p: 1.3, borderRadius: 2, bgcolor: "#315344", display: "flex", gap: 1.2, alignItems: "center" }}>
          <AccountBalanceWalletOutlinedIcon fontSize="small" />
          <Typography variant="body2" fontWeight={600}>Compensation</Typography>
        </Box>
        <Box sx={{ mt: "auto", p: 1.5, borderRadius: 2, bgcolor: "#29463a" }}>
          <Typography variant="body2" fontWeight={600}>Salary management</Typography>
          <Typography variant="caption" sx={{ color: "#b6c8bd" }}>Current employee data</Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ maxWidth: 1440, mx: "auto", px: { xs: 2, sm: 3.5, lg: 5 }, py: 3.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
            <Box>
              <Typography variant="body2" color="text.secondary">People operations / Compensation</Typography>
              <Typography variant="h4" sx={{ mt: 0.5 }}>Salary overview</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.7 }}>A clear view of how ACME pays its people.</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: "#e9f1ec", color: "primary.main", width: 34, height: 34 }}><PublicOutlinedIcon fontSize="small" /></Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>Global workforce</Typography>
                <Typography variant="caption" color="text.secondary">{countries.length || "—"} countries · {departments.length || "—"} departments</Typography>
              </Box>
            </Stack>
          </Stack>

          {error && <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError("")}>{error}</Alert>}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3.5 }}>
            <MetricCard
              label="Total employees"
              value={analytics?.headcount.toLocaleString() ?? "—"}
              detail="Across all countries"
              icon={<GroupsOutlinedIcon fontSize="small" />}
            />
            <MetricCard
              label="Currencies paid"
              value={String(currencyStats.length || "—")}
              detail="Each shown separately"
              icon={<PublicOutlinedIcon fontSize="small" />}
              tint="#f6eee5"
            />
            <MetricCard
              label="Countries represented"
              value={String(analytics?.compensation_by_country.length || "—")}
              detail={`Across ${departments.length || "—"} departments`}
              icon={<PublicOutlinedIcon fontSize="small" />}
            />
          </Stack>

          <Card sx={{ mt: 2.5 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                <Box>
                  <Typography variant="h6">Compensation by currency</Typography>
                  <Typography variant="body2" color="text.secondary">Annual base salary · amounts are not converted across currencies</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{currencyStats.length} local currencies</Typography>
              </Stack>
              <Tabs
                value={breakdown}
                onChange={(_, value: "currency" | "country" | "department") => setBreakdown(value)}
                aria-label="Compensation breakdown"
                sx={{ mt: 1.5, borderBottom: 1, borderColor: "divider" }}
              >
                <Tab value="currency" label="By currency" />
                <Tab value="country" label="By country" />
                <Tab value="department" label="By department" />
              </Tabs>
              {loading && !analytics ? <Box sx={{ py: 5, textAlign: "center" }}><CircularProgress size={28} /></Box> : (
                <Box sx={{ mt: 2 }}>
                  <SalaryBreakdown groups={breakdownGroups} />
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2.5 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                <Box>
                  <Typography variant="h6">Employee directory</Typography>
                  <Typography variant="body2" color="text.secondary">Search, filter, and manage individual salary records.</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{pagination?.total_count.toLocaleString() ?? "—"} employees</Typography>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} sx={{ my: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search name, email or employee ID"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  inputProps={{ "aria-label": "Search employees" }}
                />
                <FormControl size="small" sx={{ minWidth: { md: 190 } }}>
                  <InputLabel id="country-filter-label">All countries</InputLabel>
                  <Select
                    labelId="country-filter-label"
                    label="All countries"
                    value={country}
                    onChange={(event) => changeFilter(setCountry)(event.target.value)}
                  >
                    <MenuItem value="">All countries</MenuItem>
                    {countries.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: { md: 190 } }}>
                  <InputLabel id="department-filter-label">All departments</InputLabel>
                  <Select
                    labelId="department-filter-label"
                    label="All departments"
                    value={department}
                    onChange={(event) => changeFilter(setDepartment)(event.target.value)}
                  >
                    <MenuItem value="">All departments</MenuItem>
                    {departments.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: { md: 160 } }}>
                  <InputLabel id="sort-label">Sort by</InputLabel>
                  <Select labelId="sort-label" label="Sort by" value={sort} onChange={(event) => changeFilter(setSort)(event.target.value)}>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="salary">Salary</MenuItem>
                    <MenuItem value="department">Department</MenuItem>
                    <MenuItem value="country">Country</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Divider />
              {loading ? (
                <Box sx={{ py: 8, textAlign: "center" }}><CircularProgress size={30} /><Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Loading employee records…</Typography></Box>
              ) : employees.length === 0 ? (
                <Box sx={{ py: 7, textAlign: "center" }}>
                  <Typography fontWeight={600}>No employees found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Try a different search term or clear your filters.</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table aria-label="Employee directory">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell align="right">Annual salary</TableCell>
                          <TableCell align="right">Manage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {employees.map((employee) => (
                          <TableRow key={employee.id} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1.2} alignItems="center">
                                <Avatar sx={{ width: 36, height: 36, bgcolor: "#e9f1ec", color: "primary.main", fontSize: 13, fontWeight: 700 }}>
                                  {employee.first_name[0]}{employee.last_name[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>{employee.first_name} {employee.last_name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{employee.job_title} · {employee.employee_number}</Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>{employee.department}</TableCell>
                            <TableCell>{employee.country}</TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>{formatMoney(employee.annual_salary, employee.currency)}</Typography>
                              <Typography variant="caption" color="text.secondary">{employee.currency} / year</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditing(employee)}>
                                Edit salary
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {range} of {pagination?.total_count.toLocaleString() ?? 0}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">Page {page} of {pagination?.total_pages || 1}</Typography>
                      <Button
                        aria-label="Previous page"
                        size="small"
                        variant="outlined"
                        disabled={page <= 1}
                        onClick={() => setPage((current) => current - 1)}
                        sx={{ minWidth: 36, px: 1 }}
                      ><ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} /></Button>
                      <Button
                        aria-label="Next page"
                        size="small"
                        variant="outlined"
                        disabled={!pagination || page >= pagination.total_pages}
                        onClick={() => setPage((current) => current + 1)}
                        sx={{ minWidth: 36, px: 1 }}
                      ><ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} /></Button>
                    </Stack>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", py: 3 }}>
            Compensation data is confidential. Salary figures are shown in each employee’s recorded currency.
          </Typography>
        </Box>
      </Box>
      <EmployeeEditor employee={editing} onClose={() => setEditing(null)} onSaved={saveEmployee} />
      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice("")} message={notice} />
    </Box>
  );
}
