import { describe, it, expect, vi, beforeAll } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import VueApexCharts from 'vue3-apexcharts'

// jsdom has no SVG layout engine; give apexcharts the few measurements it asks for.
beforeAll(() => {
  const proto = window.SVGElement.prototype
  proto.getBBox = () => ({ x: 0, y: 0, width: 100, height: 20 })
  proto.getComputedTextLength = () => 50
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

// Same options shape as DashboardRsvpSummary.vue (donut) and BudgetSummary.vue (radialBar).
const donutOptions = {
  labels: ['Confirmed', 'Pending', 'Declined'],
  colors: ['#22c55e', '#facc15', '#ef4444'],
  tooltip: { enabled: true },
  legend: { show: true, labels: { colors: ['#374151'] } },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  plotOptions: { pie: { donut: { size: '70%' } } }
}

const radialOptions = {
  plotOptions: { radialBar: { hollow: { size: '60%' }, dataLabels: { value: { formatter: v => `${v}%` } } } },
  labels: ['Budget used'],
  colors: ['#8b5cf6']
}

describe('apexcharts 8 + vue3-apexcharts', () => {
  it.each([
    ['donut', donutOptions, [10, 4, 2]],
    ['radialBar', radialOptions, [65]]
  ])('renders a %s chart with the options used by the app', async (type, options, series) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mount(VueApexCharts, {
      props: { type, options, series, width: '100%', height: '200px' },
      attachTo: document.body
    })
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(error).not.toHaveBeenCalled()
    expect(wrapper.find('svg').exists()).toBe(true)
    wrapper.unmount()
    error.mockRestore()
  })
})
