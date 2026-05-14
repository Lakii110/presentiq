"use client";

import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getAdminUsers } from "@/lib/api";
import { useState } from "react";

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin", "users"], queryFn: () => getAdminUsers(0, 100), staleTime: 60_000 });

  const filtered = users.filter((u) => !search || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Users">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 sm:h-8 rounded-md border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 w-full sm:w-[240px]"
            style={{ paddingLeft: 30, paddingRight: 10 }} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Joined</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-8">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-8">No users found</TableCell></TableRow>
            ) : filtered.map((u) => (
              <TableRow key={u.id} className="transition-colors duration-150 hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground bg-primary">
                      {u.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{u.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">#{u.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-[11px] text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
