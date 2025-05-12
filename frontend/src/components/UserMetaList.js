import React, { useEffect, useState } from 'react';
import '../UserMetaList.css';

const UserMetaList = () => {
  const [userMeta, setUserMeta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://reservationsdjango-groupe-production.up.railway.app/catalogue/api/user-meta/')
      .then((response) => {
        console.log('Response:', response);
        return response.json();
      })
      .then((data) => {
        console.log('Data:', data);
        setUserMeta(data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching user meta:', error));
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="user-meta-container">
      <h1>User List</h1>
      <ul>
        {userMeta.map((meta) => (
          <li key={meta.id}>
            <span className="font-medium">{meta.user__first_name} {meta.user__last_name}</span>
            <span className="text-gray-500"> - Language: {meta.langue}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserMetaList;