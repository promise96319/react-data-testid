import { describe, expect, it } from 'vitest'
import { addTestId } from '../src/transformer'

describe('add testid', () => {
  it('self close element', () => {
    const div = `const a = <div className="test"/>`
    const { transformedCode } = addTestId({
      sourceText: div,
      randomTestId: false,
    })
    expect(transformedCode).toMatchInlineSnapshot(`
      "const a = <div className="test"/>;
      "
    `)
  })

  it('open element', () => {
    const div = `const a = <div className="test"/>`
    const { transformedCode } = addTestId({
      sourceText: div,
      randomTestId: false,
    })
    expect(transformedCode).toMatchInlineSnapshot(`
      "const a = <div className="test"/>;
      "
    `)
  })

  it('div', () => {
    const div1 = `const a = <div className="test"></div>`
    expect(
      addTestId({
        sourceText: div1,
        randomTestId: false,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <div className="test"></div>;
      "
    `)

    const div2 = `const a = <div className="test" data-testid hello="world"></div>`
    expect(
      addTestId({
        sourceText: div2,
        randomTestId: false,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <div className="test" hello="world" data-testid="93603b2f"></div>;
      "
    `)

    const div3 = `const a = <div className="test" data-testid="custom"></div>`
    expect(
      addTestId({
        sourceText: div3,
        randomTestId: false,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <div className="test" data-testid="custom"></div>;
      "
    `)
  })

  it('component', () => {
    const comp1 = `const a = <Comp className="test"/>`
    expect(
      addTestId({
        sourceText: comp1,
        randomTestId: false,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <Comp className="test" data-testid="011f91d4"/>;
      "
    `)

    const comp2 = `const a = <Comp className="test" data-testid/>`
    expect(
      addTestId({
        sourceText: comp2,
        randomTestId: false,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <Comp className="test" data-testid="f3f6fa11"/>;
      "
    `)

    const comp3 = `const a = <Comp className="test" data-testid="custom"/>`
    expect(
      addTestId({
        sourceText: comp3,
        randomTestId: false,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <Comp className="test" data-testid="custom"/>;
      "
    `)
  })

  it('child component', () => {
    const comp = `const a = <Comp.Child className="test"/>`
    expect(
      addTestId({
        sourceText: comp,
        randomTestId: false,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <Comp.Child className="test" data-testid="7c469435"/>;
      "
    `)
  })

  it('attributes', () => {
    const comp = `const a = <Comp.Child className="test" head={<Head></Head>}/>`
    expect(
      addTestId({
        sourceText: comp,
        randomTestId: false,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <Comp.Child className="test" head={<Head data-testid="a6297572"></Head>} data-testid="24f0a816"/>;
      "
    `)
  })

  it('excludeTags', () => {
    const comp = `const a = <Comp.Child className="test" head={<Head></Head>}/>`
    expect(
      addTestId({
        sourceText: comp,
        randomTestId: false,
        excludeTags: ['Comp.Child'],
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <Comp.Child className="test" head={<Head data-testid="a62975726"></Head>}/>;
      "
    `)

    expect(
      addTestId({
        sourceText: comp,
        randomTestId: false,
        excludeTags: ['Comp.Child', 'Head'],
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <Comp.Child className="test" head={<Head></Head>}/>;
      "
    `)
  })

  it('removeExcludeTags', () => {
    const comp = `const a = <Comp.Child className="test" data-testid="a62975726" head={<Head></Head>}/>`
    expect(
      addTestId({
        sourceText: comp,
        randomTestId: false,
        excludeTags: ['Comp.Child'],
        removeExcludeTags: true,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <Comp.Child className="test" head={<Head data-testid="a629757266"></Head>}/>;
      "
    `)

    expect(
      addTestId({
        sourceText: comp,
        randomTestId: false,
        excludeTags: ['Comp.Child', 'Head'],
        removeExcludeTags: true,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "const a = <Comp.Child className="test" head={<Head></Head>}/>;
      "
    `)
  })

  it('empty line', () => {
    const comp = `

    const testVar = 'testVar';

    // comment

    const b = <Comp.Child className="test" data-testid="a62975726" head={<Head></Head>}/>

    `
    expect(
      addTestId({
        sourceText: comp,
        randomTestId: false,
        excludeTags: ['Comp.Child'],
        removeExcludeTags: true,
      }).transformedCode,
    ).toMatchInlineSnapshot(`
      "

      const testVar = 'testVar';

      // comment

      const b = <Comp.Child className="test" head={<Head data-testid="a6297572662"></Head>}/>;


      "
    `)
  })
})
