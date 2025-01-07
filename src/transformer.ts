import type { Node } from 'typescript'
import ts from 'typescript'
import { TestIdKey } from './const'
import { loopCreateTestId } from './util'

function isComponentLike(name: string) {
  return /^[A-Z]/.test(name)
}

const emptyLinePlaceholder = '//__EMPTY_LINE__'

function encodeEmptyLine(sourceText: string) {
  const lines = sourceText.split('\n').map((line) => {
    if (line.trim() === '')
      return emptyLinePlaceholder
    return line
  })
  return lines.join('\n')
}

function decodeEmptyLine(sourceText: string) {
  const lines = sourceText.split('\n').map((line) => {
    if (line.trim() === emptyLinePlaceholder)
      return ''
    return line
  })
  return lines.join('\n')
}

export function parseTsx(sourceText: string, filename: string = '') {
  sourceText = encodeEmptyLine(sourceText)

  return ts.createSourceFile(
    filename,
    sourceText,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX,
  )
}

interface TestIdContext {
  // Whether testid is changed
  changed: boolean
  // Generate random testid automatically
  random: boolean
  // Don't create testid for excluded elements
  excludeTags: string[]
  // Remove testid for excluded elements.
  removeExcludeTags: boolean
}

function updateNodeAttributes(
  node: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  attributes: ts.JsxAttributeLike[],
) {
  const props = ts.factory.createNodeArray(attributes)

  const newAttributes = ts.factory.updateJsxAttributes(node.attributes, props)

  let newNode
  if (ts.isJsxOpeningElement(node)) {
    newNode = ts.factory.updateJsxOpeningElement(
      node,
      node.tagName,
      node.typeArguments,
      newAttributes,
    )
  }
  else {
    newNode = ts.factory.updateJsxSelfClosingElement(
      node,
      node.tagName,
      node.typeArguments,
      newAttributes,
    )
  }

  return newNode
}

export function transform(ast: ts.SourceFile, ctx: TestIdContext) {
  const visitor = (node: Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText()
      if (ctx.excludeTags.includes(tagName)) {
        if (ctx.removeExcludeTags) {
          ctx.changed = true
          const filteredAttributes = node.attributes.properties.filter(
            (property) => {
              return !(
                ts.isJsxAttribute(property)
                && property.name.getText() === TestIdKey
              )
            },
          )

          const newNode = updateNodeAttributes(node, [...filteredAttributes])
          return ts.visitEachChild(newNode, visitor, undefined)
        }

        return ts.visitEachChild(node, visitor, undefined)
      }

      let isComponent = false
      if (ts.isIdentifier(node.tagName)) {
        if (isComponentLike(node.tagName.getText()))
          isComponent = true
      }
      else if (ts.isPropertyAccessExpression(node.tagName)) {
        isComponent = true
      }

      const attributes = node.attributes.properties
      let hasTestIdValue = false
      const hasTestIdKey = attributes.some((property) => {
        if (
          ts.isJsxAttribute(property)
          && property.name.getText() === TestIdKey
        ) {
          const value = property.initializer
          if (!value)
            return true

          if (ts.isStringLiteral(value) && value.getText() === '')
            return true

          hasTestIdValue = true
          return true
        }
        return false
      })

      if (hasTestIdValue)
        return ts.visitEachChild(node, visitor, undefined)

      if (isComponent || hasTestIdKey) {
        ctx.changed = true
        const testidAttribute = ts.factory.createJsxAttribute(
          ts.factory.createIdentifier(TestIdKey),
          ts.factory.createStringLiteral(
            `${loopCreateTestId(node.getText(), {
              random: ctx.random,
            })}`,
          ),
        )

        const filteredAttributes = attributes.filter((property) => {
          return !(
            ts.isJsxAttribute(property) && property.name.getText() === TestIdKey
          )
        })

        const newNode = updateNodeAttributes(node, [
          ...filteredAttributes,
          testidAttribute,
        ])

        return ts.visitEachChild(newNode, visitor, undefined)
      }

      return ts.visitEachChild(node, visitor, undefined)
    }

    return ts.visitEachChild(node, visitor, undefined)
  }

  return ts.visitEachChild(ast, visitor, undefined)
}

export function generate(ast: ts.SourceFile) {
  const printer = ts.createPrinter({
    removeComments: false,
  })
  const text = printer.printFile(ast)
  return decodeEmptyLine(text)
}

export function addTestId(config: {
  sourceText: string
  fileName?: string
  randomTestId?: boolean
  excludeTags?: string[]
  removeExcludeTags?: boolean
}) {
  const {
    sourceText,
    fileName,
    randomTestId = true,
    excludeTags = [],
    removeExcludeTags = false,
  } = config
  const ast = parseTsx(sourceText, fileName)
  const ctx: TestIdContext = {
    changed: false,
    random: randomTestId,
    excludeTags,
    removeExcludeTags,
  }
  const astWithTestId = transform(ast, ctx)

  return {
    transformedCode: generate(astWithTestId),
    isTestIdChanged: ctx.changed,
  }
}
