import type { DocumentViewServerProps } from 'payload'

import React from 'react'

import { APIViewClient } from './index.client'

export function APIView(props: DocumentViewServerProps & { documentTabs: React.ReactNode }) {
  return <APIViewClient documentTabs={props.documentTabs} />
}
