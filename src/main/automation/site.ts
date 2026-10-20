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
      secondaryName: sel.css('div.wrapper.animal_name > dd'),
      breedingTab: {
        $enter: sel.css('[aria-controls="breeding"]'),
        firstPregCheck: {
          $enter: sel.css(
            `#pregnancy_checks_container table tbody tr:first-child td:nth-child(1) a`
          ),
          modal: {
            modalContent: sel.css('#main-modal > div > div'),
            date: sel.css('div.wrapper.pregnancy_check_check_date > dd'),
            method: sel.css('div.wrapper.pregnancy_check_check_method > dd'),
            result: sel.css('div.wrapper.pregnancy_check_result > dd'),
            technician: sel.css('div.wrapper.pregnancy_check_technician > dd'),
            comments: sel.css('div.wrapper.pregnancy_check_comments > dd'),
            sex: sel.css('div.wrapper.pregnancy_check_ultrasound_sex > dd'),
            timePreg: sel.css('div.wrapper.pregnancy_check_time_pregnant > dd'),
            cancel: sel.css('#main-modal > div > div > div.modal-footer > a.btn.btn-default')
          }
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
        firstBreeding: {
          $enter: sel.css('#breedings_container table tbody tr:first-child td:nth-child(1) a'),
          modal: {
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
          }
        },
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
export type PregCheckModal = typeof site.authed.profile.breedingTab.firstPregCheck.modal
export type BreedingModal = typeof site.authed.profile.breedingTab.firstBreeding.modal

export type ScopeProvider<TNode extends ScopeNode, TReturn extends ScopeNode | void = void> = (
  scope: TNode,
  ...args: never[]
) => Flow<TReturn>

export type ScopeConsumer<TNode extends ScopeNode, TReturn = void> = (
  scope: TNode,
  ...args: never[]
) => Flow<TReturn>
