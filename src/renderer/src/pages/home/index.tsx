import Flush from '@renderer/assets/eyedropper.png'
import PregCheck from '@renderer/assets/magnify.png'
import Breeding from '@renderer/assets/test-tube.png'
import { Page, PageTitlebar } from '@renderer/components/common/page'
import { iconSizes } from '@renderer/lib/tokens'
import { ProcessButton, type ProcessButtonProps } from '@renderer/pages/home/new/process-button'
import { BotIcon, type LucideIcon } from 'lucide-react'
import React from 'react'

const automations: ProcessButtonProps[] = [
  {
    processId: 'breeding',
    title: 'Breeding',
    desc: 'Enter breeding data.',
    tint: 'bg-purple-100',
    src: Breeding
  },
  {
    processId: 'flush',
    title: 'Flush',
    desc: 'Enter flush results.',
    tint: 'bg-muted',
    src: Flush
  },
  {
    processId: 'pregCheck',
    title: 'Pregnancy Check',
    desc: 'Enter preg check results.',
    tint: 'bg-purple-100',
    src: PregCheck
  }
  // {
  //   processId: 'breeding',
  //   title: 'TransOva Inventory',
  //   desc: 'Enter flush data and embryos in one step.',
  //   tint: 'bg-red-100',
  //   src: Inventory
  // },
  // {
  //   processId: 'pregCheck',
  //   title: 'Embryos',
  //   desc: 'Place embryos into inventory',
  //   tint: 'bg-red-100',
  //   src: Embryo
  // }
]

// const utilities: ProcessButtonProps[] = [
//   // {
//   //   processId: 'pregCheck',
//   //   title: 'Reconcile Inventory',
//   //   desc: 'Ensure production matches inventory',
//   //   tint: 'bg-orange-100',
//   //   src: Bag
//   // }
// ]

export function HomePage(): React.JSX.Element {
  return (
    <Page className="scrollbar-custom relative flex min-h-0 flex-1 flex-col space-y-2 overflow-y-scroll p-0">
      <SectionTitle title="Automation Processes" desc="Rapid data entry" Icon={BotIcon} />
      <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
        {automations.map((props, idx) => (
          <ProcessButton key={idx} {...props} />
        ))}
      </div>
      {/*<SectionTitle*/}
      {/*  title="Utility Processes"*/}
      {/*  desc="Prepare data for automation"*/}
      {/*  Icon={SettingsIcon}*/}
      {/*/>*/}
      {/*<div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">*/}
      {/*  {utilities.map((props, idx) => (*/}
      {/*    <ProcessButton key={idx} {...props} />*/}
      {/*  ))}*/}
      {/*</div>*/}
    </Page>
  )
}

function SectionTitle({ title, desc, Icon }: { title: string; desc: string; Icon: LucideIcon }) {
  return (
    <PageTitlebar className="bg-card sticky top-0 z-20">
      <Icon {...iconSizes.large} className="text-muted-foreground stroke-2" />
      <div className="flex w-full flex-col">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-muted-foreground text-xs">{desc}</p>
      </div>
    </PageTitlebar>
  )
}
