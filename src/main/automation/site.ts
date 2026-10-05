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
    email: sel.id('#user_email'),
    password: sel.id('#user_password'),
    remember: sel.id('#user_remember_me'),
    submit: sel.css('[data-disable-with="Sign in"]')
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
        firstPregCheck: {
          $enter: sel.css(
            `#pregnancy_checks_container table tbody tr:first-child td:nth-child(1) a`
          ),
          modal: {
            modalContent: sel.css('#main-modal > div > div'),
            date: sel.css(
              '#main-modal > div > div > div.modal-body > dl > div > div > div.wrapper.pregnancy_check_check_date > dd'
            ),
            method: sel.css(
              '#main-modal > div > div > div.modal-body > dl > div > div > div.wrapper.pregnancy_check_check_method > dd'
            ),
            result: sel.css(
              '#main-modal > div > div > div.modal-body > dl > div > div > div.wrapper.pregnancy_check_result > dd'
            ),
            technician: sel.css(
              '#main-modal > div > div > div.modal-body > dl > div > div > div.wrapper.pregnancy_check_technician > dd'
            ),
            comments: sel.css(
              '#main-modal > div > div > div.modal-body > dl > div > div > div.wrapper.pregnancy_check_comments > dd'
            ),
            sex: sel.css(
              '#main-modal > div > div > div.modal-body > dl > div > div > div.wrapper.pregnancy_check_ultrasound_sex > dd'
            ),
            timePreg: sel.css(
              '#main-modal > div > div > div.modal-body > dl > div > div > div.wrapper.pregnancy_check_time_pregnant > dd'
            ),
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
export type Profile = typeof site.authed.profile
export type BreedingTab = typeof site.authed.profile.breedingTab
export type PregCheckModal = typeof site.authed.profile.breedingTab.firstPregCheck.modal
export type PregCheckForm = typeof site.authed.profile.breedingTab.pregCheckForm
export type SearchResult = typeof site.authed.searchResult

export type ScopeProvider<TNode extends ScopeNode, TReturn extends ScopeNode | void = void> = (
  scope: TNode,
  ...args: never[]
) => Flow<TReturn>

export type ScopeConsumer<TNode extends ScopeNode, TReturn = void> = (
  scope: TNode,
  ...args: never[]
) => Flow<TReturn>
