import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                eBantu+
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">LAB Officer</span>
              <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor case processing and formula recalibration
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Cases"
            value="1,247"
            change="+12%"
            changeType="positive"
          />
          <StatCard
            title="Pending Validation"
            value="23"
            change="-5%"
            changeType="negative"
          />
          <StatCard
            title="Processed Today"
            value="45"
            change="+18%"
            changeType="positive"
          />
          <StatCard
            title="Formula Accuracy"
            value="95.2%"
            change="+2.1%"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="Upload New Case"
            description="Upload and process Syariah Court documents"
            icon="📄"
            href="/upload"
            bgColor="bg-blue-50 border-blue-200"
          />
          <QuickActionCard
            title="Review Validations"
            description="Validate AI-extracted data from recent cases"
            icon="✅"
            href="/validation"
            bgColor="bg-green-50 border-green-200"
          />
          <QuickActionCard
            title="Update Formulas"
            description="Recalibrate nafkah iddah and mutaah formulas"
            icon="📊"
            href="/formulas"
            bgColor="bg-purple-50 border-purple-200"
          />
        </div>

        {/* Recent Cases */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <CaseRow
              title="SYC2025001 - Divorce Proceeding"
              status="validated"
              uploadedAt="2 hours ago"
              extractedData={{
                income: 3500,
                nafkahIddah: 800,
                mutaah: 15
              }}
            />
            <CaseRow
              title="SYC2025002 - Maintenance Application"
              status="pending"
              uploadedAt="4 hours ago"
              extractedData={{
                income: 4200,
                nafkahIddah: 900,
                mutaah: 18
              }}
            />
            <CaseRow
              title="SYC2025003 - Financial Relief"
              status="processing"
              uploadedAt="6 hours ago"
              extractedData={{
                income: 2800,
                nafkahIddah: 650,
                mutaah: 12
              }}
            />
          </div>
          <div className="px-6 py-3 bg-gray-50 text-center">
            <Link href="/cases" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Cases →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
}

function StatCard({ title, value, change, changeType }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-lg font-medium text-gray-500">{title}</div>
          </div>
        </div>
        <div className="mt-1 flex items-baseline">
          <div className="text-3xl font-semibold text-gray-900">{value}</div>
          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </div>
        </div>
      </div>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  icon: string
  href: string
  bgColor: string
}

function QuickActionCard({ title, description, icon, href, bgColor }: QuickActionCardProps) {
  return (
    <Link href={href} className="group">
      <div className={`${bgColor} border-2 rounded-lg p-6 hover:shadow-md transition-shadow`}>
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  )
}

interface CaseRowProps {
  title: string
  status: 'validated' | 'pending' | 'processing'
  uploadedAt: string
  extractedData: {
    income: number
    nafkahIddah: number
    mutaah: number
  }
}

function CaseRow({ title, status, uploadedAt, extractedData }: CaseRowProps) {
  const statusColors = {
    validated: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <span>{uploadedAt}</span>
            <span className="mx-2">•</span>
            <span>Income: ${extractedData.income}</span>
            <span className="mx-2">•</span>
            <span>Nafkah: ${extractedData.nafkahIddah}</span>
            <span className="mx-2">•</span>
            <span>Mutaah: ${extractedData.mutaah}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
    </div>
  )
}