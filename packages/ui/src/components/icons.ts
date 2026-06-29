/**
 * Optimized Lucide Icons Bundle
 *
 * This file imports ONLY the icons actually used in our application.
 *
 * Bundle Size Impact:
 * - Before: ~1.2MB uncompressed / ~350KB gzipped (full lucide-react)
 * - After: ~55KB uncompressed / ~16KB gzipped (71 icons)
 * - Savings: ~334KB gzipped ✅
 *
 * Usage:
 * - Website app: 44 icons
 * - Admin app: 27 additional icons
 * - Total: 71 icons vs ~1,400 in full library (95% reduction)
 *
 * @see icon-audit.md for complete audit details
 */

import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BarChart3,
  Bold,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Code,
  Cookie,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  FileCode,
  FileText,
  Github,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  Heart,
  Home,
  Image,
  ImagePlus,
  Info,
  Italic,
  LayoutDashboard,
  Lightbulb,
  Link,
  Linkedin,
  List,
  ListOrdered,
  Loader,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MailOpen,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Moon,
  Pencil,
  Phone,
  Plus,
  Quote,
  Redo2,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Strikethrough,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  Twitter,
  Undo2,
  Unlink,
  Upload,
  User,
  Users,
  X,
  XCircle,
  Zap,
  ZoomIn,
  type LucideProps,
} from "lucide-react";

// Re-export all icons for direct import
export {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BarChart3,
  Bold,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Code,
  Cookie,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  FileCode,
  FileText,
  Github,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  Heart,
  Home,
  Image,
  ImagePlus,
  Info,
  Italic,
  LayoutDashboard,
  Lightbulb,
  Link,
  Linkedin,
  List,
  ListOrdered,
  Loader,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MailOpen,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Moon,
  Pencil,
  Phone,
  Plus,
  Quote,
  Redo2,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Strikethrough,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  Twitter,
  Undo2,
  Unlink,
  Upload,
  User,
  Users,
  X,
  XCircle,
  Zap,
  ZoomIn,
};

export type { LucideProps };

/**
 * Type-safe union of all available icon names
 * This provides autocomplete and type checking for Icon component
 */
export type IconName =
  | "AlertCircle"
  | "AlertTriangle"
  | "Archive"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "Award"
  | "BarChart3"
  | "Bold"
  | "BookOpen"
  | "Briefcase"
  | "Building"
  | "Building2"
  | "Calendar"
  | "Check"
  | "CheckCircle"
  | "CheckCircle2"
  | "ChevronDown"
  | "ChevronLeft"
  | "ChevronRight"
  | "ChevronUp"
  | "Circle"
  | "Clock"
  | "Code"
  | "Cookie"
  | "Download"
  | "Edit"
  | "ExternalLink"
  | "Eye"
  | "EyeOff"
  | "Facebook"
  | "FileCode"
  | "FileText"
  | "Github"
  | "Globe"
  | "Heading1"
  | "Heading2"
  | "Heading3"
  | "Heart"
  | "Home"
  | "Image"
  | "ImagePlus"
  | "Info"
  | "Italic"
  | "LayoutDashboard"
  | "Lightbulb"
  | "Link"
  | "Linkedin"
  | "List"
  | "ListOrdered"
  | "Loader"
  | "Loader2"
  | "Lock"
  | "LogIn"
  | "LogOut"
  | "Mail"
  | "MailOpen"
  | "MapPin"
  | "Menu"
  | "MessageSquare"
  | "Minus"
  | "Moon"
  | "Pencil"
  | "Phone"
  | "Plus"
  | "Quote"
  | "Redo"
  | "Redo2"
  | "RefreshCw"
  | "Search"
  | "Send"
  | "Settings"
  | "Share2"
  | "Shield"
  | "ShieldCheck"
  | "Sparkles"
  | "Strikethrough"
  | "Sun"
  | "Target"
  | "Trash2"
  | "TrendingUp"
  | "Twitter"
  | "Undo"
  | "Undo2"
  | "Unlink"
  | "Upload"
  | "User"
  | "Users"
  | "X"
  | "XCircle"
  | "Zap"
  | "ZoomIn";

/**
 * Icon registry for dynamic icon lookup
 * Maps icon names to their components
 */
export const iconRegistry = {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BarChart3,
  Bold,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Code,
  Cookie,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  FileCode,
  FileText,
  Github,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  Heart,
  Home,
  Image,
  ImagePlus,
  Info,
  Italic,
  LayoutDashboard,
  Lightbulb,
  Link,
  Linkedin,
  List,
  ListOrdered,
  Loader,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MailOpen,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Moon,
  Pencil,
  Phone,
  Plus,
  Quote,
  Redo: Redo2,
  Redo2,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Strikethrough,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  Twitter,
  Undo: Undo2,
  Undo2,
  Unlink,
  Upload,
  User,
  Users,
  X,
  XCircle,
  Zap,
  ZoomIn,
} as const;
