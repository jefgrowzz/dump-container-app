"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive";
  lastActive: string;
};

interface UsersTableProps {
  users: User[];
  openEditModal: (type: "user", item: User) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, openEditModal }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="secondary">{user.role}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={user.status === "active" ? "success" : "destructive"}>
                  {user.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{user.lastActive}</td>
              <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => openEditModal("user", user)}>
                  <Edit size={16} />
                </Button>
                <Button size="sm" variant="outline" className="text-red-500">
                  <Trash2 size={16} />
                </Button>
                <Button size="sm" variant="outline">
                  <Eye size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
