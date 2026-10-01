import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { MeetingRoom, ListAlt } from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import { RoomManagementContent } from './RoomManagement';
import { AdminApprovalsContent } from './AdminApprovals';

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} id={`meeting-rooms-tabpanel-${index}`}
      aria-labelledby={`meeting-rooms-tab-${index}`}
      sx={{ pt: 3 }}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

export default function MeetingRooms() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchTab = new URLSearchParams(location.search).get('tab');
  const initialTab = location.state?.tab === 'approvals' || searchTab === 'approvals' ? 1 : 0;
  const [tab, setTab] = useState(initialTab);

  const handleChange = (e, newValue) => {
    setTab(newValue);
    // Keep URL in sync so refresh keeps the selected tab
    navigate(newValue === 1 ? '/admin/meeting-rooms?tab=approvals' : '/admin/meeting-rooms', {
      replace: true,
    });
  };

  return (
    <AdminLayout>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Meeting Rooms</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          aria-label="Meeting Rooms tabs"
          variant="fullWidth"
          sx={{
            '& .MuiTabs-flexContainer': { width: '100%' },
            '& .MuiTab-root': { flex: 1, maxWidth: 'none' },
          }}
        >
          <Tab
            icon={<MeetingRoom />}
            iconPosition="start"
            label="Room Management"
            id="meeting-rooms-tab-0"
            aria-controls="meeting-rooms-tabpanel-0"
          />
          <Tab
            icon={<ListAlt />}
            iconPosition="start"
            label="Booking Approval"
            id="meeting-rooms-tab-1"
            aria-controls="meeting-rooms-tabpanel-1"
          />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <RoomManagementContent embedded />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <AdminApprovalsContent embedded />
      </TabPanel>
    </AdminLayout>
  );
}
