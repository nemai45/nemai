// Mock data for the application

// User types
export type UserType = "artist" | "customer"

// User profile
export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  user_type: UserType
  created_at: string
  updated_at: string
}

// Artist profile
export interface ArtistProfile {
  id: string
  bio: string | null
  location: string | null
  years_of_experience: number | null
  average_rating: number | null
  instagram_handle: string | null
  is_verified: boolean | null
  available_for_home_service: boolean | null
  created_at: string
  updated_at: string
}

// Service
export interface Service {
  id: string
  artist_id: string
  name: string
  description: string | null
  price: number
  duration: number
  created_at: string
  updated_at: string
}

// Portfolio item
export interface PortfolioItem {
  id: string
  artist_id: string
  title: string | null
  description: string | null
  image_url: string
  created_at: string
  updated_at: string
}

// Appointment
export interface Appointment {
  id: string
  artist_id: string
  customer_id: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
  location_type: string
  address: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
  service?: Service
  customer?: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
  artist?: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

// Availability
export interface Availability {
  id: string
  artist_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

// Blocked date
export interface BlockedDate {
  id: string
  artist_id: string
  blocked_date: string
  reason: string | null
  created_at: string
  updated_at: string
}

// Mock users
export const mockUsers = [
  {
    id: "1",
    email: "artist@example.com",
    password: "password",
    user_metadata: {
      user_type: "artist",
    },
  },
  {
    id: "2",
    email: "customer@example.com",
    password: "password",
    user_metadata: {
      user_type: "customer",
    },
  },
]

// Mock profiles
export const mockProfiles: Profile[] = [
  {
    id: "1",
    first_name: "Crystal",
    last_name: "Nguyen",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    user_type: "artist",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    first_name: "Sarah",
    last_name: "Johnson",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
    user_type: "customer",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock artist profiles
export const mockArtistProfiles: ArtistProfile[] = [
  {
    id: "1",
    bio: "I specialize in intricate nail art designs and gel extensions. With 5+ years of experience, I bring your nail vision to life with a focus on quality and creativity.",
    location: "Downtown",
    years_of_experience: 5,
    average_rating: 4.9,
    instagram_handle: "crystal_nails",
    is_verified: true,
    available_for_home_service: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock services
export const mockServices: Service[] = [
  {
    id: "1",
    artist_id: "1",
    name: "Gel Manicure",
    description: "Long-lasting gel polish application with cuticle care and nail shaping.",
    price: 45,
    duration: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    artist_id: "1",
    name: "Acrylic Full Set",
    description: "Full set of acrylic nails with your choice of polish.",
    price: 85,
    duration: 90,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    artist_id: "1",
    name: "Nail Art",
    description: "Custom nail art designs per nail.",
    price: 5,
    duration: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock portfolio items
export const mockPortfolioItems: PortfolioItem[] = [
  {
    id: "1",
    artist_id: "1",
    title: "Cover: Summer Collection",
    description: "My latest summer nail art designs featuring bright colors and tropical motifs.",
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800&h=800",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    artist_id: "1",
    title: "Floral Designs",
    description: "Delicate floral patterns perfect for spring and summer.",
    image_url: "https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&q=80&w=400&h=400",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    artist_id: "1",
    title: "Floral Designs",
    description: "Abstract floral design with gold accents.",
    image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=400&h=400",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    artist_id: "1",
    title: "Geometric",
    description: "Modern geometric patterns in bold colors.",
    image_url: "https://images.unsplash.com/photo-1610992015779-46217a252221?auto=format&fit=crop&q=80&w=400&h=400",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    artist_id: "1",
    title: "Geometric",
    description: "Minimalist geometric design in neutral tones.",
    image_url: "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?auto=format&fit=crop&q=80&w=400&h=400",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock appointments
export const mockAppointments: Appointment[] = [
  {
    id: "1",
    artist_id: "1",
    customer_id: "2",
    service_id: "1",
    appointment_date: "2023-06-15",
    start_time: "10:00:00",
    end_time: "11:00:00",
    location_type: "artist_location",
    address: null,
    notes: "First time client, excited for my gel manicure!",
    status: "completed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    service: mockServices[0],
    customer: {
      first_name: "Sarah",
      last_name: "Johnson",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
    },
    artist: {
      first_name: "Crystal",
      last_name: "Nguyen",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    },
  },
  {
    id: "2",
    artist_id: "1",
    customer_id: "2",
    service_id: "2",
    appointment_date: "2023-07-20",
    start_time: "14:00:00",
    end_time: "15:30:00",
    location_type: "customer_location",
    address: "123 Main St, Apt 4B",
    notes: "Please bring pink and white acrylic options.",
    status: "confirmed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    service: mockServices[1],
    customer: {
      first_name: "Sarah",
      last_name: "Johnson",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
    },
    artist: {
      first_name: "Crystal",
      last_name: "Nguyen",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    },
  },
  {
    id: "3",
    artist_id: "1",
    customer_id: "2",
    service_id: "3",
    appointment_date: "2023-08-05",
    start_time: "11:00:00",
    end_time: "12:00:00",
    location_type: "artist_location",
    address: null,
    notes: "Looking for something with flowers for a wedding.",
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    service: mockServices[2],
    customer: {
      first_name: "Sarah",
      last_name: "Johnson",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
    },
    artist: {
      first_name: "Crystal",
      last_name: "Nguyen",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    },
  },
]

// Mock availability
export const mockAvailability: Availability[] = [
  {
    id: "1",
    artist_id: "1",
    day_of_week: 1, // Monday
    start_time: "09:00:00",
    end_time: "17:00:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    artist_id: "1",
    day_of_week: 2, // Tuesday
    start_time: "09:00:00",
    end_time: "17:00:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    artist_id: "1",
    day_of_week: 3, // Wednesday
    start_time: "09:00:00",
    end_time: "17:00:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    artist_id: "1",
    day_of_week: 4, // Thursday
    start_time: "09:00:00",
    end_time: "17:00:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    artist_id: "1",
    day_of_week: 5, // Friday
    start_time: "09:00:00",
    end_time: "17:00:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    artist_id: "1",
    day_of_week: 6, // Saturday
    start_time: "10:00:00",
    end_time: "16:00:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock blocked dates
export const mockBlockedDates: BlockedDate[] = [
  {
    id: "1",
    artist_id: "1",
    blocked_date: "2023-07-04",
    reason: "Holiday",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    artist_id: "1",
    blocked_date: "2023-08-15",
    reason: "Vacation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Featured artists for the landing page
export const featuredArtists = [
  {
    id: "1",
    name: "Sparkle Unicorn Nails",
    rating: 4.9,
    reviews: 124,
    location: "Downtown",
    image: "https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&q=80&w=400&h=400",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "2",
    name: "Magical Manicures",
    rating: 4.8,
    reviews: 98,
    location: "East Village",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=400&h=400",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "3",
    name: "Rainbow Tips",
    rating: 4.7,
    reviews: 87,
    location: "West Side",
    image: "https://images.unsplash.com/photo-1610992015779-46217a252221?auto=format&fit=crop&q=80&w=400&h=400",
    profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "4",
    name: "Glamour Claws",
    rating: 4.9,
    reviews: 156,
    location: "North Hills",
    image: "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?auto=format&fit=crop&q=80&w=400&h=400",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
  },
]

// Testimonials for the landing page
export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Regular Customer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
    content:
      "I've been using Unicorn Nails for months now, and I'm consistently impressed by the quality of artists on the platform. The booking process is seamless, and I love being able to see an artist's portfolio before making a decision.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "First-time User",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
    content:
      "I surprised my wife with an at-home nail service for her birthday, and she was thrilled! The artist was professional, arrived on time, and did an amazing job. Will definitely use this platform again.",
    rating: 5,
  },
  {
    id: 3,
    name: "Jessica Martinez",
    role: "Nail Artist",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
    content:
      "As a nail artist, this platform has helped me grow my client base significantly. The booking system is user-friendly, and I appreciate how easy it is to showcase my portfolio and manage my schedule.",
    rating: 4,
  },
]
