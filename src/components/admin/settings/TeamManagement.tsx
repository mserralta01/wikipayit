import React from 'react'
import { TeamManagement as TeamManagementComponent } from '../../admin/TeamManagement';

export default function TeamManagement() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Team Management</h1>
      <TeamManagementComponent />
    </div>
  )
} 