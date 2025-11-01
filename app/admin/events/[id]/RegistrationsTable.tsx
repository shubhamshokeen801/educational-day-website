'use client';

import { useState, useMemo } from 'react';
import RegistrationSearchBar from './registerationSearchBar';

interface RegistrationRow {
  id: string;
  payment_status: string;
  registered_at: string;
  user_id: string | null;
  team_id: string | null;
  users?: { name: string; email: string } | { name: string; email: string }[];
  teams?: { team_name: string; team_code: string } | { team_name: string; team_code: string }[];
}

interface TeamMember {
  name: string;
  email: string;
}

interface RegistrationsTableProps {
  registrations: RegistrationRow[];
  teamMembersMap: Record<string, TeamMember[]>;
}

export default function RegistrationsTable({
  registrations,
  teamMembersMap
}: RegistrationsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations;

    const query = searchQuery.toLowerCase();

    return registrations.filter((reg) => {
      const user = Array.isArray(reg.users) && reg.users.length > 0
        ? reg.users[0]
        : (reg.users as any);

      const team = Array.isArray(reg.teams) && reg.teams.length > 0
        ? reg.teams[0]
        : (reg.teams as any);

      // Search in team name
      if (reg.team_id && team?.team_name) {
        if (team.team_name.toLowerCase().includes(query)) return true;
        if (team.team_code?.toLowerCase().includes(query)) return true;
      }

      // Search in user name
      if (user?.name && user.name.toLowerCase().includes(query)) return true;

      // Search in team members
      if (reg.team_id && teamMembersMap[reg.team_id]) {
        const memberMatch = teamMembersMap[reg.team_id].some(
          (member) =>
            member.name.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query)
        );
        if (memberMatch) return true;
      }

      // Search in solo participant email
      if (user?.email && user.email.toLowerCase().includes(query)) return true;

      return false;
    });
  }, [registrations, searchQuery, teamMembersMap]);

  return (
    <>
      <RegistrationSearchBar onSearch={setSearchQuery} />

      {filteredRegistrations?.length ? (
        <>
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredRegistrations.length} of {registrations.length} registration(s)
          </div>
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-neutral-800">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Participant / Team</th>
                <th className="p-2 border">Members</th>
                <th className="p-2 border">Payment Status</th>
                <th className="p-2 border">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg, i) => {
                const user =
                  Array.isArray(reg.users) && reg.users.length > 0
                    ? reg.users[0]
                    : (reg.users as any);

                const team =
                  Array.isArray(reg.teams) && reg.teams.length > 0
                    ? reg.teams[0]
                    : (reg.teams as any);

                return (
                  <tr
                    key={reg.id}
                    className="odd:bg-white even:bg-gray-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-800"
                  >
                    <td className="p-2 border text-center">{i + 1}</td>

                    <td className="p-2 border font-medium">
                      {reg.team_id
                        ? `${team?.team_name ?? "Unnamed Team"} (${team?.team_code})`
                        : user?.name ?? "Solo Participant"}
                    </td>

                    <td className="p-2 border">
                      {reg.team_id ? (
                        <ul className="list-disc list-inside">
                          {teamMembersMap[reg.team_id]?.map((member, idx) => (
                            <li key={idx}>
                              {member.name} ({member.email})
                            </li>
                          )) ?? <li>—</li>}
                        </ul>
                      ) : (
                        user?.email
                      )}
                    </td>

                    <td
                      className={`p-2 border text-center capitalize ${
                        reg.payment_status === "approved"
                          ? "text-green-600"
                          : reg.payment_status === "pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {reg.payment_status}
                    </td>

                    <td className="p-2 border text-center">
                      {new Date(reg.registered_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          {searchQuery ? 'No registrations match your search.' : 'No registrations found.'}
        </p>
      )}
    </>
  );
}