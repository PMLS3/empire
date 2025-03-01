/**
 * This composable is used in conjunction with the LayoutSwitcher component.
 * It provides a simple way to switch between different layouts, for demo purposes.
 * Layout components are imported below to be made available to the composable.
 */

import {
  CollapseLayout,
  SidebarLayout,
  TopnavLayout,
  IconnavLayout,
} from '#components'

export function useLayoutSwitcher() {
  const layouts = [
    {
      name: 'sidebar',
      label: 'Sidebar',
      component: SidebarLayout,
    },
    {
      name: 'collapse',
      label: 'Collapse',
      component: CollapseLayout,
    },
    {
      name: 'topnav',
      label: 'Top navigation',
      component: TopnavLayout,
    },
    {
      name: 'iconnav',
      label: 'Icon top navigation',
      component: IconnavLayout,
    },
  ] as const

  const activeLayoutName = useState('layout-switcher-active', () => 'sidebar')
  const activeLayout = computed(() => {
    return layouts.find(layout => layout.name === activeLayoutName.value)
  })
  const activeLayoutComponent = computed(() => {
    return activeLayout.value?.component || SidebarLayout
  })

  return {
    layouts,
    activeLayout,
    activeLayoutName,
    activeLayoutComponent,
  }
}
