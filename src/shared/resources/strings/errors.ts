// these are what get routed to the toaster in the responseLink
export const errors = {
  unknown: 'An unknown error has occurred.',
  unreadableFile: 'File could not be read.',
  pathNotFound: "Couldn't locate that file.",
  database: 'Something went wrong.',
  notFound: 'Could not find that item.',
  invalidSheet: 'This sheet has validation errors.',
  jobAlreadyComplete: 'Job already completed'
} as const
