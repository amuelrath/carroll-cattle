import type { Flow } from '@main/automation/types'
import { sel } from '@shared/automation'
import type { TSelector } from '@shared/automation/sel'

const ENTERABLE_SCOPE = '$enter' as const
type TerminalNode = { [key: string]: TSelector }
export type ScopeNode =
  | TerminalNode
  | {
      [ENTERABLE_SCOPE]?: TSelector
      [key: string]: ScopeNode | TSelector | undefined
    }

export const ROOT_URL = 'https://carrollcattlecompany.cattlemax.com/'

export const site = {
  unauthed: {
    email: sel.role('textbox', { name: 'Email *' }),
    password: sel.role('textbox', { name: 'Password *' }),
    submit: sel.role('button', { name: 'Sign in' })
  },
  authed: {
    sidebar: {
      searchbar: sel.placeholder('Search Cattle'),
      submitSearch: sel.css('.submitSearch')
    },
    profile: {
      name: sel.css('#header-title-subtitle > span.page-title'),
      breedingTab: {
        $enter: sel.css('[aria-controls="breeding"]'),
        pregCheckTable: sel.css('#pregnancy_checks_container table'),
        pregCheckModal: {
          modalContent: sel.css('#main-modal > div > div'),
          date: sel.css('div.wrapper.pregnancy_check_check_date > dd'),
          method: sel.css('div.wrapper.pregnancy_check_check_method > dd'),
          result: sel.css('div.wrapper.pregnancy_check_result > dd'),
          technician: sel.css('div.wrapper.pregnancy_check_technician > dd'),
          comments: sel.css('div.wrapper.pregnancy_check_comments > dd'),
          sex: sel.css('div.wrapper.pregnancy_check_ultrasound_sex > dd'),
          timePreg: sel.css('div.wrapper.pregnancy_check_time_pregnant > dd'),
          cancel: sel.css('#main-modal > div > div > div.modal-footer > a.btn.btn-default')
        },
        pregCheckForm: {
          $enter: sel.id('#new-pregnancy-check'),
          date: sel.id('#pregnancy_check_check_date'),
          method: sel.id('#pregnancy_check_check_method'),
          result: sel.id('#pregnancy_check_result'),
          technician: sel.id('#pregnancy_check_technician'),
          comments: sel.id('#pregnancy_check_comments'),
          ultrasoundSex: sel.id('#pregnancy_check_ultrasound_sex'),
          timePregnant: sel.id('#pregnancy_check_time_pregnant'),
          submit: sel.css('[data-disable-with="Saving Pregnancy Check"]')
        },
        breedingModal: {
          modalContent: sel.css('#main-modal > div > div'),
          date: sel.css('div.wrapper.breeding_breeding_date > dd'),
          method: sel.css('div.wrapper.breeding_breeding_method > dd'),
          bullTag: sel.css('div.wrapper.breeding_sire > dd'),
          // possibly get the link instead for extra verification
          embryo: sel.css('div.wrapper.breeding_embryo > dd'),
          clSide: sel.css('div.wrapper.breeding_embryo_cl_side > dd'),
          comments: sel.css('div.wrapper.breeding_comments > dd'),
          cancel: sel.css('#main-modal > div > div > div.modal-footer > a.btn.btn-default'),
          // WatchMe: for some reason 'technician' gets rendered twice in the modal.
          technician: sel.css(
            '#main-modal > div > div > div.modal-body > dl > div > div > div:nth-child(2) > dd'
          )
        },
        breedingTable: sel.css('#breedings_container table'),
        breedingForm: {
          $enter: sel.id('#new-breeding'),
          method: sel.id('#breeding_breeding_method'),
          date: sel.id('#breeding_breeding_date'),
          comments: sel.id('#breeding_comments'),
          technician: sel.id('#breeding_technician'),
          // Format: "Loud and Heavy x 01C (#: 3 / CC: 50699-1)"
          embryo: sel.id('#breeding_embryo_id'),
          clSide: sel.id('#breeding_embryo_cl_side'),
          bull: {
            $enter: sel.id('#s2id_breeding_bull_animal_id'),
            searchbar: sel.role('combobox', { name: 'Bull' })
          },
          submit: sel.css('[data-disable-with="Saving Breeding"]')
        }
      },
      embryoTab: {
        $enter: sel.role('tab', { name: 'Embryo' }),
        flushTable: sel.id('#flushes_table'),
        flushModal: {
          modalContent: sel.css('#main-modal > div > div'),
          date: sel.css('div.wrapper.flush_flush_date > dd'),
          sireTag: sel.css('div.wrapper.flush_sire_animal_id > dd'),
          type: sel.css('div.wrapper.flush_flush_type > dd'),
          recovered: sel.css('div.wrapper.flush_recovered > dd'),
          usable: sel.css('div.wrapper.flush_usable > dd'),
          unfertilized: sel.css('div.wrapper.flush_unfertilized > dd'),
          degenerate: sel.css('div.wrapper.flush_degenerate > dd'),
          discarded: sel.css('div.wrapper.flush_discarded > dd'),
          transferred: sel.css('div.wrapper.flush_transferred > dd'),
          frozen: sel.css('div.wrapper.flush_embryos_frozen > dd'),
          comments: sel.css('div.wrapper.flush_comments > dd'),
          cancel: sel.css('#main-modal > div > div > div.modal-footer > a.btn.btn-default')
        },
        flushForm: {
          $enter: sel.role('link', { name: 'New Flush' }),
          date: sel.id('#flush_flush_date'),
          type: sel.id('#flush_flush_type'),
          comments: sel.id('#flush_comments'),
          recovered: sel.id('#flush_recovered'),
          degenerate: sel.id('#flush_degenerate'),
          unfertilized: sel.id('#flush_unfertilized'),
          discarded: sel.id('#flush_discarded'),
          usable: sel.id('#flush_usable'),
          transferred: sel.id('#flush_transferred'),
          frozen: sel.id('#flush_embryos_frozen'),
          bull: {
            $enter: sel.id('#s2id_flush_sire_animal_id'),
            searchbar: sel.role('combobox', { name: 'Sire' })
          },
          cancel: sel.text('Cancel'),
          submit: sel.text('Create Flush')
        }
      }
    },
    searchResult: {
      header: sel.css('#main-container > div > div > div > h2'),
      noResults: sel.css('#main-container > div > div > div > div > div > div'),
      animalsTable: sel.id('#animals_table'),
      searchbar: sel.css('form > #search')
    }
  }
} as const satisfies Record<string, ScopeNode>

export type Site = typeof site
export type Authed = typeof site.authed
export type SearchResult = typeof site.authed.searchResult
export type Profile = typeof site.authed.profile
export type BreedingTab = typeof site.authed.profile.breedingTab
export type PregCheckModal = typeof site.authed.profile.breedingTab.pregCheckModal
export type BreedingModal = typeof site.authed.profile.breedingTab.breedingModal
export type EmbryoTab = typeof site.authed.profile.embryoTab
export type FlushModal = typeof site.authed.profile.embryoTab.flushModal

export type ScopeProvider<TNode extends ScopeNode, TReturn extends ScopeNode | void = void> = (
  scope: TNode,
  ...args: never[]
) => Flow<TReturn>

export type ScopeConsumer<TNode extends ScopeNode, TReturn = void> = (
  scope: TNode,
  ...args: never[]
) => Flow<TReturn>
