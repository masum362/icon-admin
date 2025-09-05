import { ClipboardList } from 'lucide-react'
import React from 'react'

const QuestionDetails = () => {
  return (
    <div className="card mt-6 p-6">
        <h2 className="text-xl font-semibold flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                Question Attempt List
              </h2>
    </div>
  )
}

export default QuestionDetails