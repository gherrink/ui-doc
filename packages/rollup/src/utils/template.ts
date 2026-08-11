import type { FileSystem, Renderer } from '@ui-doc/core'

type TemplateType = 'layout' | 'page' | 'partial'

interface ReloadableRenderer extends Renderer {
  addLayout: (name: string, source: { source: string; content: string }) => void
  addPage: (name: string, source: { source: string; content: string }) => void
  addPartial: (name: string, source: { source: string; content: string }) => void
}

/**
 * Determines the template type based on the file path.
 */
export function getTemplateType(filePath: string): TemplateType | undefined {
  if (filePath.includes('/layouts/')) {
    return 'layout'
  }
  if (filePath.includes('/pages/')) {
    return 'page'
  }
  if (filePath.includes('/partials/')) {
    return 'partial'
  }
  return undefined
}

/**
 * Extracts the template name from the file path.
 */
export function getTemplateName(filePath: string, fileSystem: FileSystem): string {
  return fileSystem.fileBasename(filePath)
}

/**
 * Type guard to check if a renderer supports template reloading.
 */
export function isReloadableRenderer(renderer: Renderer): renderer is ReloadableRenderer {
  return (
    typeof (renderer as ReloadableRenderer).addLayout === 'function' &&
    typeof (renderer as ReloadableRenderer).addPage === 'function' &&
    typeof (renderer as ReloadableRenderer).addPartial === 'function'
  )
}

/**
 * Reloads a single template file into the renderer.
 */
export async function reloadTemplate(
  filePath: string,
  renderer: Renderer,
  fileSystem: FileSystem,
): Promise<boolean> {
  if (!isReloadableRenderer(renderer)) {
    return false
  }

  const templateType = getTemplateType(filePath)
  if (templateType === undefined) {
    return false
  }

  const name = getTemplateName(filePath, fileSystem)
  const content = (await fileSystem.fileRead(filePath)).trim()

  switch (templateType) {
    case 'layout':
      renderer.addLayout(name, { source: filePath, content })
      break
    case 'page':
      renderer.addPage(name, { source: filePath, content })
      break
    case 'partial':
      renderer.addPartial(name, { source: filePath, content })
      break
  }

  return true
}

/**
 * Checks if a file path is within the template directory.
 */
export function isTemplateFile(filePath: string, templatePath: string): boolean {
  return filePath.startsWith(templatePath)
}
