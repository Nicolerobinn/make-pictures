import React, { useEffect } from 'react';
import Dashboard from '../Dashboard';
import Touch from '../Touch';
const AboutPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      {' '}
      <Dashboard /> <Touch />{' '}
    </div>
  );
};
export default AboutPage;
