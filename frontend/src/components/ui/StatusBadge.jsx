import React from 'react'
import { STATUS_BADGE_CLASSES } from '../../utils/constants'
import { humanize } from '../../utils/helpers'

export default function StatusBadge({ status, size = 'sm' }) {
  const classes = STATUS_BADGE_CLASSES[status] || 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
  return (
    <span className={`
      inline-flex items-center rounded-full font-medium whitespace-nowrap
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}
      ${classes}
    `}>
      {humanize(status)}
    </span>
  )
}