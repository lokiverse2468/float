'use client';

import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import DomainIcon from '@mui/icons-material/Domain';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import LinkIcon from '@mui/icons-material/Link';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';

const company = {
  name: 'Datavalley',
  orgId: '60044602735',
  email: 'lokeshchinthakindi2468@gmail.com',
  phone: '9550711095',
  accessUrl: 'https://crm.zoho.in/crm/org60044602735/',
  timezone: 'GMT 5:30) India Standard Time (Asia/Kolkata)',
};

const TABS = [
  'Company Details',
  'Domain Mapping',
  'Fiscal Year',
  'Business hours',
  'Holidays',
  'Currencies',
  'Hierarchy Preference'
];

export default function CompanyPage() {
  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      bgcolor: '#f7f9fa',
      p: 3,
      pt: 5
    }}>
      <Box
        sx={{
          borderRadius: 2,
          maxWidth: 1220,
          mx: "auto",
          bgcolor: "#fff",
          p: 0,
          border: "1px solid #e8eaf0",
          boxShadow: 'none'
        }}
      >
        {/* Sticky Tabs */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            bgcolor: "#fff",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", pl: 4, pt: 2 }}>
            {TABS.map((tab, idx) => (
              <Button
                key={tab}
                disableRipple
                variant="text"
                sx={{
                  borderBottom: idx === 0 ? "3px solid #1976d2" : "3px solid transparent",
                  borderRadius: 0,
                  px: 2,
                  py: 0,
                  minWidth: 0,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  color: idx === 0 ? "#222d46" : "#344767",
                  fontSize: 16,
                  textTransform: "none",
                  mb: -1,
                  mr: 0.5,
                  '&:hover': { bgcolor: 'transparent', color: '#3f51b5' },
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>
          <Divider sx={{ mt: 0.5, mb: 0, bgcolor: "#ecedf1" }} />
        </Box>

        {/* Inner Content */}
        <Box sx={{
          p: 4,
          pt: 3,
          bgcolor: "#fff",
          minHeight: 500,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
            {/* Logo */}
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: '#eef0f4',
                color: '#b8b9bc',
                fontSize: 32,
                border: '1px solid #e0e2e7'
              }}
              variant="rounded"
            >
              <DomainIcon fontSize="inherit" />
            </Avatar>

            {/* Company Info */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography fontWeight={700} fontSize={18} color="#23282c">
                  {company.name}
                </Typography>
                <Typography color="#8a93a2" fontSize={16}>(200)</Typography>
                <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                  <EditIcon sx={{ fontSize: 16, color: '#b2b4b9' }} />
                </IconButton>
              </Box>
              <Typography sx={{ color: '#4180c6', fontSize: 14, mb: 1.5, fontWeight: 500 }}>
                Org ID: {company.orgId}
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <EmailOutlinedIcon sx={{ fontSize: 16, color: "#859ab2" }} />
                <Typography sx={{ fontSize: 14, color: "#333" }}>
                  {company.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#859ab2" }} />
                <Typography sx={{ fontSize: 14, color: "#333" }}>
                  {company.phone}
                </Typography>
              </Box>
              
              {/* Additional Icons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <LocalPhoneOutlinedIcon sx={{ color: "#a4adc5", fontSize: 16 }} />
                <PrintOutlinedIcon sx={{ color: "#a4adc5", fontSize: 16 }} />
                <LinkIcon sx={{ color: "#a4adc5", fontSize: 16 }} />
                <RoomOutlinedIcon sx={{ color: "#a4adc5", fontSize: 16 }} />
                <PublicOutlinedIcon sx={{ color: "#a4adc5", fontSize: 16 }} />
              </Box>
            </Box>
          </Box>

          {/* Access URL Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#23282c' }}>Access URL</Typography>
              <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                <EditIcon sx={{ fontSize: 16, color: "#b2b4b9" }} />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 0.5 }}>
              <Typography color="#838a9c" fontSize={14} sx={{ minWidth: 35 }}>URL</Typography>
              <Typography sx={{
                fontSize: 14, color: "#1976d2", fontWeight: 500,
                wordBreak: "break-all"
              }}>
                {company.accessUrl}
              </Typography>
              <Tooltip title="Copy">
                <IconButton size="small" sx={{ p: 0.5 }}>
                  <ContentCopyIcon sx={{ fontSize: 16, color: "#b2b4b9" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Locale Info */}
          <Box>
            <Typography fontWeight={700} fontSize={15} mb={1} color="#23282c">
              Locale Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 0.5 }}>
              <Typography color="#838a9c" fontSize={14} sx={{ minWidth: 75 }}>Time Zone</Typography>
              <Typography fontSize={14} color="#333">
                ({company.timezone})
              </Typography>
              <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                <EditIcon sx={{ fontSize: 16, color: "#b2b4b9" }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}