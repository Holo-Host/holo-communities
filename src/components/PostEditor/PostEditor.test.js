/* eslint-env jest */
import React from 'react'
import { merge } from 'lodash'
import { shallow } from 'enzyme'
import PostEditor, { ActionsBar } from './PostEditor'

describe('PostEditor', () => {
  it('renders with min props', () => {
    const props = {}
    const wrapper = shallow(<PostEditor {...props} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders announcement option with admin in props', () => {
    const props = {
      canModerate: true
    }
    const wrapper = shallow(<PostEditor {...props} />)
    expect(wrapper).toMatchSnapshot()
  })

  describe('for a new post', () => {
    test('initial prompt and placeholders', () => {
      const props = {
        initialPrompt: 'a test prompt',
        titlePlaceholderForPostType: {
          default: 'a test title placeholder'
        },
        detailsPlaceholder: 'details placeholder'
      }
      const wrapper = shallow(<PostEditor {...props} />)
      expect(wrapper).toMatchSnapshot()
    })

    const titlePlaceholderForPostType = {
      discussion: 'discussion placeholder',
      request: 'request placeholder',
      offer: 'offer placeholder',
      default: 'default placeholder'
    }
    const renderForType = (type) => {
      const props = {
        post: { type, communities: [] },
        titlePlaceholderForPostType
      }
      return shallow(<PostEditor {...props} />)
    }
    ['discussion', 'request', 'offer'].forEach(postType =>
      test(`correct title placeholder and type button selection for "${postType}" type`, () => {
        expect(renderForType(postType)).toMatchSnapshot()
      })
    )

    test('saving a post will create a new post', () => {
      const props = {
        post: {
          type: 'offer',
          title: 'valid title',
          communities: [
            { id: '1', name: 'test community 1' },
            { id: '2', name: 'test community 2' }
          ],
          topicNames: ['design'],
          startTime: new Date(1551908483315),
          endTime: new Date(1551908483315)
        },
        createPost: jest.fn(() => new Promise(() => {})),
        setAnnouncement: jest.fn()
      }
      const editorMock = {
        getContentHTML: () => props.post.details,
        reset: jest.fn()
      }
      const topicSelectorMock = {
        getSelected: () => [{ id: 1, name: 'design' }]
      }
      const communitiesSelectorMock = {
        reset: jest.fn()
      }
      const wrapper = shallow(<PostEditor {...props} />)
      const testInstance = wrapper.instance()
      testInstance.editor.current = editorMock
      testInstance.topicSelector.current = topicSelectorMock
      testInstance.communitiesSelector.current = communitiesSelectorMock
      testInstance.save()
      expect(props.createPost.mock.calls).toHaveLength(1)
      expect(props.createPost.mock.calls).toMatchSnapshot()
    })
  })

  describe.skip('for a new event', () => {
    it('renders correctlry', () => {
      const props = {
        isEvent: true,
        post: {
          communities: []
        }
      }
      const wrapper = shallow(<PostEditor {...props} />)
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('editing a post', () => {
    const props = {
      editing: true,
      post: {
        id: 'test',
        type: 'request',
        title: 'valid title',
        linkPreview: { id: '1', title: 'a link' },
        communities: [
          { id: '1', name: 'test community 1' },
          { id: '2', name: 'test community 2' }
        ],
        topicNames: ['design'],
        startTime: new Date(1551908483315),
        endTime: new Date(1551908483315)
      },
      updatePost: jest.fn(() => new Promise(() => {})),
      showImagePreviews: true,
      setAnnouncement: jest.fn()
    }

    test('form in editing mode', () => {
      const wrapper = shallow(<PostEditor {...props} />)
      expect(wrapper).toMatchSnapshot()
    })

    test('post is loaded into fields', () => {
      const wrapper = shallow(<PostEditor {...props} />)
      expect(wrapper).toMatchSnapshot()
    })

    test('saving a post will update a post', () => {
      const editorMock = {
        getContentHTML: () => props.post.details,
        reset: jest.fn()
      }
      const topicSelectorMock = {
        getSelected: () => [{ id: 1, name: 'design' }]
      }
      const communitiesSelectorMock = {
        reset: jest.fn()
      }
      const wrapper = shallow(<PostEditor {...props} />)
      const testInstance = wrapper.instance()
      testInstance.editor.current = editorMock
      testInstance.topicSelector.current = topicSelectorMock
      testInstance.communitiesSelector.current = communitiesSelectorMock
      testInstance.save()
      expect(props.updatePost.mock.calls).toHaveLength(1)
      expect(props.updatePost.mock.calls).toMatchSnapshot()
    })
  })

  it('post is defaulted while loading editor', () => {
    const props = {
      editing: true,
      loading: true
    }
    const wrapper = shallow(<PostEditor {...props} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('post is defaulted while loading editor for NEW post', () => {
    const props = {
      editing: false,
      loading: true
    }
    const wrapper = shallow(<PostEditor {...props} />)
    expect(wrapper).toMatchSnapshot()
  })

  describe('valid', () => {
    it('is valid when all required values are supplied', () => {
      const props = {
        post: {
          type: 'request',
          title: 'valid title',
          communities: [
            { id: '1', name: 'test community 1' }
          ]
        }
      }
      const testInstance = shallow(<PostEditor {...props} />).instance()
      testInstance.editor.current = { isEmpty: jest.fn(() => false) }
      expect(testInstance.isValid(props.post, {})).toBeTruthy()
    })

    it('is invalid when required values are missing', () => {
      const props = {
        post: {
          title: 'valid title',
          communities: [],
          type: 'Request'
        }
      }
      const testInstance = shallow(<PostEditor {...props} />).instance()
      testInstance.editor = { isEmpty: jest.fn(() => false) }
      expect(testInstance.isValid(props.post, {})).toBeFalsy()
    })
  })

  test('onClose is attached to the close button', () => {
    const props = {
      onClose: jest.fn()
    }
    const wrapper = shallow(<PostEditor {...props} />)
    expect(wrapper.find('[data-stylename="initial-closeButton"]').props().onClick)
      .toEqual(props.onClose)
  })

  test('saving a valid post will update a post', () => {
    const props = {
      editing: true,
      post: {
        id: 'test',
        type: 'offer',
        title: 'valid title',
        linkPreview: { id: '1', title: 'a link' },
        communities: [
          { id: '1', name: 'test community 1' },
          { id: '2', name: 'test community 2' }
        ],
        topicNames: ['design'],
        startTime: new Date(1551908483315),
        endTime: new Date(1551908483315)
      },
      updatePost: jest.fn(() => new Promise(() => {})),
      setAnnouncement: jest.fn()
    }
    const editorMock = {
      getContentHTML: () => props.post.details,
      reset: jest.fn()
    }
    const topicSelectorMock = {
      getSelected: () => [{ id: 1, name: 'design' }]
    }
    const communitiesSelectorMock = {
      reset: jest.fn()
    }
    const wrapper = shallow(<PostEditor {...props} />)
    const testInstance = wrapper.instance()
    testInstance.editor.current = editorMock
    testInstance.topicSelector.current = topicSelectorMock
    testInstance.communitiesSelector.current = communitiesSelectorMock
    testInstance.save()
    expect(props.updatePost.mock.calls).toHaveLength(1)
    expect(props.updatePost.mock.calls).toMatchSnapshot()
  })

  describe('linkPreview handling', () => {
    let baseProps, contentStateMock
    beforeEach(() => {
      baseProps = {
        post: { communities: [] },
        pollingFetchLinkPreview: jest.fn(),
        clearLinkPreview: jest.fn()
      }
      contentStateMock = {
        getBlockMap: () => ([]),
        hasText: () => true
      }
    })

    it('should fetch for a linkPreview', () => {
      const props = baseProps
      const wrapper = shallow(<PostEditor {...props} />)
      const testInstance = wrapper.instance()
      testInstance.setLinkPreview(contentStateMock)
      expect(props.pollingFetchLinkPreview.mock.calls).toHaveLength(1)
    })

    it('should not fetch for linkPreview when a post.linkPreview is present', () => {
      const props = merge(baseProps, {
        post: {
          linkPreview: {},
          communities: []
        }
      })
      const wrapper = shallow(<PostEditor {...props} />)
      const testInstance = wrapper.instance()
      testInstance.setLinkPreview(contentStateMock)
      expect(props.pollingFetchLinkPreview.mock.calls).toHaveLength(0)
    })

    it('should not fetch for linkPreview when linkStatus is "removed"', () => {
      const props = merge(baseProps, {
        linkPreviewStatus: 'removed'
      })
      const wrapper = shallow(<PostEditor {...props} />)
      const testInstance = wrapper.instance()
      testInstance.setLinkPreview(contentStateMock)
      expect(props.pollingFetchLinkPreview.mock.calls).toHaveLength(0)
    })

    it('should not fetch for linkPreview when linkStatus is "invalid"', () => {
      const props = merge(baseProps, {
        linkPreviewStatus: 'invalid'
      })
      const wrapper = shallow(<PostEditor {...props} />)
      const testInstance = wrapper.instance()
      testInstance.setLinkPreview(contentStateMock)
      expect(props.pollingFetchLinkPreview.mock.calls).toHaveLength(0)
    })

    it('should reset linkPreview when there is no text and any linkStatus is present', () => {
      contentStateMock = {
        hasText: () => false
      }
      const props = merge(baseProps, {
        linkPreviewStatus: 'any'
      })
      const wrapper = shallow(<PostEditor {...props} />)
      const testInstance = wrapper.instance()
      testInstance.setLinkPreview(contentStateMock)
      expect(props.pollingFetchLinkPreview.mock.calls).toHaveLength(0)
      expect(props.clearLinkPreview.mock.calls).toHaveLength(1)
    })

    it('should not reset linkPreview when there is no text but there is a linkPreview present', () => {
      contentStateMock = {
        hasText: () => false
      }
      const props = merge(baseProps, {
        linkPreviewStatus: null,
        post: {
          linkPreview: {}
        }
      })
      const wrapper = shallow(<PostEditor {...props} />)
      const testInstance = wrapper.instance()
      testInstance.setLinkPreview(contentStateMock)
      expect(props.pollingFetchLinkPreview.mock.calls).toHaveLength(0)
      expect(props.clearLinkPreview.mock.calls).toHaveLength(0)
    })
  })

  it('renders contribution button', () => {
    const props = {
      isProject: true,
      currentUser: {
        hasStripeAccount: true,
        hasFeature: () => true
      }
    }
    const wrapper = shallow(<PostEditor {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('ActionsBar', () => {
  it('matches last snapshot', () => {
    const props = {
      id: 1,
      addImage: () => {},
      showImagePreviews: true,
      valid: true,
      loading: false,
      submitButtonLabel: 'Save',
      save: () => {}
    }
    const wrapper = shallow(<ActionsBar {...props} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('matches last snapshot while loading', () => {
    const props = {
      id: 1,
      addImage: () => {},
      showImagePreviews: true,
      valid: true,
      loading: true,
      submitButtonLabel: 'Posting...',
      save: () => {}
    }
    const wrapper = shallow(<ActionsBar {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
