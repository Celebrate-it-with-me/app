import Spectrum from 'spectrum-vanilla'

const SpectrumDirective = {
  mounted(el, { value }) {
    Spectrum.getInstance(el, Object.assign({}, value));
  },
  updated(el, { value }) {
    const sp = Spectrum.getInstance(el, Object.assign({}, value));

    if (JSON.stringify(value) !== JSON.stringify(sp.options)) {
      sp.rebuild(Object.assign({}, value));
    }
  },
  unmounted(el) {
    const sp = Spectrum.getInstance(el);
    sp.destroy();
  }
};

export { SpectrumDirective }
