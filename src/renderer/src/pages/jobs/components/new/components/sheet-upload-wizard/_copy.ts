import { ArrowLeftRightIcon, FileStackIcon, type LucideIcon } from 'lucide-react'
import { Step } from './index'

const selectSheetBase = {
  backButton: 'Cancel',
  previewLabel: 'Sheet Preview',
  submitButton: 'Select Sheet'
}

export const selectSheetCopy = {
  ...selectSheetBase,
  empty: {
    message: 'Sheet is Empty'
  },
  errors: {
    filePath: "Couldn't locate that file."
  },
  multi: {
    title: 'Select a Sheet',
    description:
      'The file you uploaded contains multiple sheets. Select the sheet you would like to use.',
    selectPlaceholder: 'Theme',
    errors: {
      headRows: 'Please select a non-empty sheet.'
    }
  },
  single: {
    title: 'Confirm Sheet',
    description: 'Review the sheet below before we import it.',
    errors: {
      headRows: 'This sheet is empty. Try another file.'
    }
  }
} as const

export const mapColumnCopy = {
  title: 'Map Columns',
  description: 'Match the column names from the uploaded sheet to the required ones.',
  submitButton: 'Confirm Import',
  backButton: 'Back',
  yourColumn: 'Your Column',
  requiredColumn: 'Required Column',
  error: 'All required columns must have assignments.'
} as const

export const stepMeta: Record<Step, { icon: LucideIcon; step: string }> = {
  'select-sheet': {
    icon: FileStackIcon,
    step: '1 of 2'
  },
  'map-columns': {
    icon: ArrowLeftRightIcon,
    step: '2 of 2'
  }
}
