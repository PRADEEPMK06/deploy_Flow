import { 
  LayoutDashboard, 
  GitBranch, 
  Rocket, 
  Activity, 
  Terminal, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  Server,
  Globe // Add this icon import
} from 'lucide-react';

// Inside your component navItems array, add:
{ name: 'Live Deploy', path: '/deploy-live', icon: Globe },