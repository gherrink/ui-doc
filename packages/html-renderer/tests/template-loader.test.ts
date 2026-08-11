import type { FileFinder, FileFinderOnFoundCallback, FileSystem } from '@ui-doc/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { HtmlRenderer } from '../src/HtmlRenderer'
import { TemplateLoader } from '../src/TemplateLoader'

describe('templateLoader', () => {
  let mockIsDirectory: ReturnType<typeof vi.fn<FileSystem['isDirectory']>>
  let mockCreateFileFinder: ReturnType<typeof vi.fn<FileSystem['createFileFinder']>>
  let mockFileBasename: ReturnType<typeof vi.fn<FileSystem['fileBasename']>>
  let mockFileRead: ReturnType<typeof vi.fn<FileSystem['fileRead']>>
  let mockFinderSearch: ReturnType<typeof vi.fn<FileFinder['search']>>
  let mockAddLayout: ReturnType<typeof vi.fn<HtmlRenderer['addLayout']>>
  let mockAddPage: ReturnType<typeof vi.fn<HtmlRenderer['addPage']>>
  let mockAddPartial: ReturnType<typeof vi.fn<HtmlRenderer['addPartial']>>

  let mockFileSystem: FileSystem
  let mockFinder: {
    search: ReturnType<typeof vi.fn<FileFinder['search']>>
    matches: ReturnType<typeof vi.fn<FileFinder['matches']>>
    directories: ReturnType<typeof vi.fn<FileFinder['directories']>>
  }
  let mockRenderer: HtmlRenderer

  beforeEach(() => {
    vi.clearAllMocks()

    mockIsDirectory = vi.fn<FileSystem['isDirectory']>()
    mockFileBasename = vi.fn<FileSystem['fileBasename']>()
    mockFileRead = vi.fn<FileSystem['fileRead']>()
    mockFinderSearch = vi.fn<FileFinder['search']>()
    mockAddLayout = vi.fn<HtmlRenderer['addLayout']>().mockReturnThis()
    mockAddPage = vi.fn<HtmlRenderer['addPage']>().mockReturnThis()
    mockAddPartial = vi.fn<HtmlRenderer['addPartial']>().mockReturnThis()

    mockFinder = {
      search: mockFinderSearch,
      matches: vi.fn<FileFinder['matches']>(() => true),
      directories: vi.fn<FileFinder['directories']>(() => []),
    }

    mockCreateFileFinder = vi.fn<FileSystem['createFileFinder']>().mockReturnValue(mockFinder)

    mockFileSystem = {
      isDirectory: mockIsDirectory,
      createFileFinder: mockCreateFileFinder,
      fileBasename: mockFileBasename,
      fileRead: mockFileRead,
    } as unknown as FileSystem

    mockRenderer = {
      addLayout: mockAddLayout,
      addPage: mockAddPage,
      addPartial: mockAddPartial,
    } as unknown as HtmlRenderer
  })

  describe('tEMPLATES_PACKAGE', () => {
    it('should have correct package path value', () => {
      expect(TemplateLoader.TEMPLATES_PACKAGE).toBe('@ui-doc/html-renderer/templates')
    })
  })

  describe('load', () => {
    it('should load templates from all three folders', async () => {
      const templatePath = '/templates'

      mockIsDirectory.mockResolvedValue(true)

      mockFileBasename
        .mockReturnValueOnce('main')
        .mockReturnValueOnce('index')
        .mockReturnValueOnce('header')

      mockFileRead
        .mockResolvedValueOnce('<html>layout</html>')
        .mockResolvedValueOnce('<html>page</html>')
        .mockResolvedValueOnce('<div>partial</div>')

      mockFinderSearch
        .mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
          await callback('/templates/layouts/main.html')
        })
        .mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
          await callback('/templates/pages/index.html')
        })
        .mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
          await callback('/templates/partials/header.html')
        })

      await TemplateLoader.load({
        renderer: mockRenderer,
        fileSystem: mockFileSystem,
        templatePath,
      })

      expect(mockIsDirectory).toHaveBeenCalledWith('/templates/layouts')
      expect(mockIsDirectory).toHaveBeenCalledWith('/templates/pages')
      expect(mockIsDirectory).toHaveBeenCalledWith('/templates/partials')
      expect(mockIsDirectory).toHaveBeenCalledTimes(3)

      expect(mockAddLayout).toHaveBeenCalledWith('main', {
        content: '<html>layout</html>',
        source: '/templates/layouts/main.html',
      })
      expect(mockAddPage).toHaveBeenCalledWith('index', {
        content: '<html>page</html>',
        source: '/templates/pages/index.html',
      })
      expect(mockAddPartial).toHaveBeenCalledWith('header', {
        content: '<div>partial</div>',
        source: '/templates/partials/header.html',
      })
    })

    it('should skip folder that does not exist', async () => {
      const templatePath = '/templates'

      mockIsDirectory
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)

      mockFileBasename.mockReturnValueOnce('main').mockReturnValueOnce('header')

      mockFileRead
        .mockResolvedValueOnce('<html>layout</html>')
        .mockResolvedValueOnce('<div>partial</div>')

      mockFinderSearch
        .mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
          await callback('/templates/layouts/main.html')
        })
        .mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
          await callback('/templates/partials/header.html')
        })

      await TemplateLoader.load({
        renderer: mockRenderer,
        fileSystem: mockFileSystem,
        templatePath,
      })

      expect(mockCreateFileFinder).toHaveBeenCalledTimes(2)
      expect(mockCreateFileFinder).toHaveBeenCalledWith(['/templates/layouts/*.html'])
      expect(mockCreateFileFinder).toHaveBeenCalledWith(['/templates/partials/*.html'])

      expect(mockAddLayout).toHaveBeenCalledTimes(1)
      expect(mockAddPage).not.toHaveBeenCalled()
      expect(mockAddPartial).toHaveBeenCalledTimes(1)
    })

    it('should skip all folders when none exist', async () => {
      const templatePath = '/templates'

      mockIsDirectory.mockResolvedValue(false)

      await TemplateLoader.load({
        renderer: mockRenderer,
        fileSystem: mockFileSystem,
        templatePath,
      })

      expect(mockIsDirectory).toHaveBeenCalledTimes(3)
      expect(mockCreateFileFinder).not.toHaveBeenCalled()
      expect(mockAddLayout).not.toHaveBeenCalled()
      expect(mockAddPage).not.toHaveBeenCalled()
      expect(mockAddPartial).not.toHaveBeenCalled()
    })

    it('should trim whitespace from file content', async () => {
      const templatePath = '/templates'

      mockIsDirectory
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)

      mockFileBasename.mockReturnValueOnce('main')

      mockFileRead.mockResolvedValueOnce('  \n  <html>layout</html>  \n  ')

      mockFinderSearch.mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
        await callback('/templates/layouts/main.html')
      })

      await TemplateLoader.load({
        renderer: mockRenderer,
        fileSystem: mockFileSystem,
        templatePath,
      })

      expect(mockAddLayout).toHaveBeenCalledWith('main', {
        content: '<html>layout</html>',
        source: '/templates/layouts/main.html',
      })
    })

    it('should load multiple files from single folder', async () => {
      const templatePath = '/templates'

      mockIsDirectory
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)

      mockFileBasename
        .mockReturnValueOnce('header')
        .mockReturnValueOnce('footer')
        .mockReturnValueOnce('sidebar')

      mockFileRead
        .mockResolvedValueOnce('<header>Header</header>')
        .mockResolvedValueOnce('<footer>Footer</footer>')
        .mockResolvedValueOnce('<aside>Sidebar</aside>')

      mockFinderSearch.mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
        await callback('/templates/partials/header.html')
        await callback('/templates/partials/footer.html')
        await callback('/templates/partials/sidebar.html')
      })

      await TemplateLoader.load({
        renderer: mockRenderer,
        fileSystem: mockFileSystem,
        templatePath,
      })

      expect(mockAddPartial).toHaveBeenCalledTimes(3)
      expect(mockAddPartial).toHaveBeenCalledWith('header', {
        content: '<header>Header</header>',
        source: '/templates/partials/header.html',
      })
      expect(mockAddPartial).toHaveBeenCalledWith('footer', {
        content: '<footer>Footer</footer>',
        source: '/templates/partials/footer.html',
      })
      expect(mockAddPartial).toHaveBeenCalledWith('sidebar', {
        content: '<aside>Sidebar</aside>',
        source: '/templates/partials/sidebar.html',
      })
    })

    it('should handle empty folder with no HTML files found', async () => {
      const templatePath = '/templates'

      mockIsDirectory
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)

      mockFinderSearch.mockImplementationOnce(async () => {
        // No files found, callback never invoked
      })

      await TemplateLoader.load({
        renderer: mockRenderer,
        fileSystem: mockFileSystem,
        templatePath,
      })

      expect(mockCreateFileFinder).toHaveBeenCalledTimes(1)
      expect(mockCreateFileFinder).toHaveBeenCalledWith(['/templates/layouts/*.html'])
      expect(mockAddLayout).not.toHaveBeenCalled()
    })

    it('should construct correct glob patterns for each folder', async () => {
      const templatePath = '/custom/path'

      mockIsDirectory.mockResolvedValue(true)

      mockFinderSearch.mockResolvedValue(undefined)

      await TemplateLoader.load({
        renderer: mockRenderer,
        fileSystem: mockFileSystem,
        templatePath,
      })

      expect(mockCreateFileFinder).toHaveBeenCalledWith(['/custom/path/layouts/*.html'])
      expect(mockCreateFileFinder).toHaveBeenCalledWith(['/custom/path/pages/*.html'])
      expect(mockCreateFileFinder).toHaveBeenCalledWith(['/custom/path/partials/*.html'])
    })

    it('should process all folders in parallel', async () => {
      const templatePath = '/templates'
      const callOrder: string[] = []

      mockIsDirectory.mockImplementation(async (path: string) => {
        callOrder.push(`isDirectory:${path}`)
        return true
      })

      mockFileBasename
        .mockReturnValueOnce('main')
        .mockReturnValueOnce('index')
        .mockReturnValueOnce('header')

      mockFileRead
        .mockResolvedValueOnce('<html>layout</html>')
        .mockResolvedValueOnce('<html>page</html>')
        .mockResolvedValueOnce('<div>partial</div>')

      mockFinderSearch
        .mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
          callOrder.push('search:layouts')
          await callback('/templates/layouts/main.html')
        })
        .mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
          callOrder.push('search:pages')
          await callback('/templates/pages/index.html')
        })
        .mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
          callOrder.push('search:partials')
          await callback('/templates/partials/header.html')
        })

      await TemplateLoader.load({
        renderer: mockRenderer,
        fileSystem: mockFileSystem,
        templatePath,
      })

      // All isDirectory calls should happen before any search calls
      const firstSearchIndex = callOrder.findIndex(call => call.startsWith('search:'))
      const allIsDirectoryIndices = callOrder
        .map((call, idx) => (call.startsWith('isDirectory:') ? idx : -1))
        .filter(idx => idx !== -1)

      expect(allIsDirectoryIndices.every(idx => idx < firstSearchIndex)).toBe(true)
    })

    it('should propagate error when fileRead fails', async () => {
      const templatePath = '/templates'
      const readError = new Error('Failed to read file')

      mockIsDirectory
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)

      mockFileBasename.mockReturnValue('main')

      mockFileRead.mockRejectedValue(readError)

      mockFinderSearch.mockImplementationOnce(async (callback: FileFinderOnFoundCallback) => {
        await callback('/templates/layouts/main.html')
      })

      await expect(
        TemplateLoader.load({
          renderer: mockRenderer,
          fileSystem: mockFileSystem,
          templatePath,
        }),
      ).rejects.toThrow('Failed to read file')
    })

    it('should propagate error when isDirectory fails', async () => {
      const templatePath = '/templates'
      const dirError = new Error('Directory check failed')

      mockIsDirectory.mockRejectedValue(dirError)

      await expect(
        TemplateLoader.load({
          renderer: mockRenderer,
          fileSystem: mockFileSystem,
          templatePath,
        }),
      ).rejects.toThrow('Directory check failed')
    })
  })
})
