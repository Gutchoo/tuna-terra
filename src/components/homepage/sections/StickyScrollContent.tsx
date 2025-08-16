'use client'

import { motion } from 'framer-motion'
import { Building, Users, BarChart3, Zap } from 'lucide-react'

interface ContentCardProps {
  icon: React.ReactNode
  title: string
  features: string[]
  gradient: string
}

function ContentCard({ icon, title, features, gradient }: ContentCardProps) {
  return (
    <div className={`h-full w-full p-6 bg-gradient-to-br ${gradient} rounded-lg relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-white/10" />
      </div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        
        <div className="space-y-3 flex-1">
          {features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 text-white/90"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              <span className="text-sm">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/5 rounded-full blur-lg" />
      </div>
    </div>
  )
}

export const stickyScrollContent = [
  {
    title: "Portfolio Visualization",
    description: "Transform your real estate data into interactive visual experiences. See your properties on detailed maps with parcel boundaries, assess portfolio performance at a glance, and discover insights that drive better investment decisions.",
    gradient: "from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700",
    content: (
      <ContentCard
        icon={<Building className="w-5 h-5 text-white" />}
        title="Interactive Maps"
        gradient="from-blue-500 to-cyan-500"
        features={[
          "Property parcel overlays",
          "Satellite & street view modes",
          "Custom map markers",
          "Neighborhood analytics",
          "Zoom & filter controls"
        ]}
      />
    )
  },
  {
    title: "Data Intelligence",
    description: "Harness the power of comprehensive property data and analytics. Track market trends, monitor property values, generate detailed reports, and make data-driven decisions with confidence using our advanced intelligence platform.",
    gradient: "from-emerald-600 to-green-600 dark:from-emerald-700 dark:to-green-700",
    content: (
      <ContentCard
        icon={<BarChart3 className="w-5 h-5 text-white" />}
        title="Smart Analytics"
        gradient="from-emerald-500 to-green-500"
        features={[
          "Market trend analysis",
          "Value appreciation tracking",
          "Custom report generation",
          "Performance dashboards",
          "Comparative market insights"
        ]}
      />
    )
  },
  {
    title: "Team Collaboration",
    description: "Enable seamless collaboration across your real estate team. Share portfolios securely, assign roles and permissions, collaborate on property analysis, and keep everyone aligned with real-time updates and notifications.",
    gradient: "from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700",
    content: (
      <ContentCard
        icon={<Users className="w-5 h-5 text-white" />}
        title="Team Workspace"
        gradient="from-purple-500 to-pink-500"
        features={[
          "Secure portfolio sharing",
          "Role-based permissions",
          "Real-time collaboration",
          "Team activity tracking",
          "Comment & annotation system"
        ]}
      />
    )
  },
  {
    title: "Workflow Automation",
    description: "Streamline your real estate operations with intelligent automation. Set up smart alerts for market changes, automate data refreshes, receive notifications for important updates, and eliminate manual tasks to focus on what matters most.",
    gradient: "from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700",
    content: (
      <ContentCard
        icon={<Zap className="w-5 h-5 text-white" />}
        title="Smart Automation"
        gradient="from-orange-500 to-red-500"
        features={[
          "Automated data refreshes",
          "Market change alerts",
          "Custom notification rules",
          "Scheduled report delivery",
          "Integration workflows"
        ]}
      />
    )
  }
]