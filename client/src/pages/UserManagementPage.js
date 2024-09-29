import React, { useEffect, useState } from 'react';
import api from '../services/axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Assuming you're using Bootstrap for styling

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users/admin');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleBlockUsers = async () => {
    try {
      for (let userId of selectedUsers) {
        await api.patch(`/users/${userId}/block`);
      }
      alert('Selected users blocked successfully');
    } catch (error) {
      console.error('Error blocking users', error);
    }
  };

  const handleUnblockUsers = async () => {
    try {
      for (let userId of selectedUsers) {
        await api.patch(`/users/${userId}/unblock`);
      }
      alert('Selected users unblocked successfully');
    } catch (error) {
      console.error('Error unblocking users', error);
    }
  };

  const handleDeleteUsers = async () => {
    try {
      for (let userId of selectedUsers) {
        await api.delete(`/users/${userId}`);
      }
      alert('Selected users deleted successfully');
      // Optionally refresh the user list after deletion
    } catch (error) {
      console.error('Error deleting users', error);
    }
  };

  return (
    <div className="container">
      <h1>User Management</h1>
      <div className="toolbar">
        <button className="btn btn-danger" onClick={handleBlockUsers}>
          Block
        </button>
        <button className="btn btn-primary" onClick={handleUnblockUsers}>
          Unblock
        </button>
        <button className="btn btn-secondary" onClick={handleDeleteUsers}>
          Delete
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length}
                onChange={handleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Last Login</th>
            <th>Registration Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.last_login || 'Never'}</td>
              <td>{user.registration_time}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;

