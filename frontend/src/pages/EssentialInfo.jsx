import { Box, Typography, Paper, Grid, Card, CardContent, Button, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Info, Phone, Email, Schedule, Description, Download, HealthAndSafety, SupportAgent,
} from '@mui/icons-material';
import EmployeeLayout from '../components/EmployeeLayout';

const companyInfo = [
  {
    icon: <Schedule color="primary" />,
    title: 'Working Hours',
    lines: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 1:00 PM', 'Sunday & public holidays: Closed'],
  },
  {
    icon: <Phone color="primary" />,
    title: 'Important Contacts',
    lines: ['HR Department: +1 555 0100', 'IT Helpdesk: +1 555 0101', 'Reception: +1 555 0102'],
  },
  {
    icon: <Email color="primary" />,
    title: 'Email Directory',
    lines: ['HR: hr@meetspace.com', 'IT Support: support@meetspace.com', 'General: info@meetspace.com'],
  },
  {
    icon: <HealthAndSafety color="primary" />,
    title: 'Workplace Policies',
    lines: ['Leave policy: 20 days annual leave', 'Sick leave: 10 days per year', 'Dress code: business casual'],
  },
  {
    icon: <SupportAgent color="primary" />,
    title: 'IT & Facilities',
    lines: ['VPN setup guide available on request', 'Report facility issues to reception', 'Meeting rooms booked via MeetSpace'],
  },
  {
    icon: <Info color="primary" />,
    title: 'Company Overview',
    lines: ['MeetSpace HQ, 4th Floor, Tower B', 'Founded in 2020', 'Employee ID required for building access'],
  },
];

const forms = [
  { name: 'Leave Application Form', format: 'PDF', description: 'Apply for annual, sick or casual leave.' },
  { name: 'Expense Reimbursement Form', format: 'Excel', description: 'Claim business travel and expense refunds.' },
  { name: 'Employee Feedback Form', format: 'PDF', description: 'Share feedback about workplace processes.' },
  { name: 'Training Request Form', format: 'PDF', description: 'Request approval for external training.' },
  { name: 'Asset Request Form', format: 'Excel', description: 'Request laptop, accessories or other equipment.' },
];

export default function EssentialInfo() {
  return (
    <EmployeeLayout>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Essential Information & Forms</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Company information, policies and downloadable forms in one place.
      </Typography>

      {/* Company Information */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Company Information</Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {companyInfo.map((section, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  {section.icon}
                  <Typography variant="h6" fontWeight="bold">{section.title}</Typography>
                </Box>
                <Divider sx={{ mb: 1.5 }} />
                <List disablePadding>
                  {section.lines.map((line, j) => (
                    <ListItem key={j} disableGutters sx={{ py: 0.5 }}>
                      <ListItemText primary={line} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Forms */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Forms</Typography>
      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        <List disablePadding>
          {forms.map((form, i) => (
            <Box key={i}>
              <ListItem
                sx={{ py: 2, px: 3, display: 'flex', alignItems: 'center', gap: 2 }}
                secondaryAction={
                  <Button variant="outlined" size="small" startIcon={<Download />} sx={{ textTransform: 'none' }}>
                    Download ({form.format})
                  </Button>
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Description color="primary" />
                </ListItemIcon>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{form.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{form.description}</Typography>
                </Box>
              </ListItem>
              {i < forms.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>
    </EmployeeLayout>
  );
}
