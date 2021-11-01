import { Property } from '@frp-ts/core'
import { EventTarget } from '@frp-ts/core/src'
// no idea why eslint doesn't see this package
// eslint-disable-next-line import/no-unresolved
import * as CSS from 'csstype'

type NativeAnimationEvent = AnimationEvent
type NativeClipboardEvent = ClipboardEvent
type NativeCompositionEvent = CompositionEvent
type NativeDragEvent = DragEvent
type NativeFocusEvent = FocusEvent
type NativeKeyboardEvent = KeyboardEvent
type NativeMouseEvent = MouseEvent
type NativeTouchEvent = TouchEvent
type NativePointerEvent = PointerEvent
type NativeTransitionEvent = TransitionEvent
type NativeUIEvent = UIEvent
type NativeWheelEvent = WheelEvent

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSXInternal {
	type Primitive = string | number | boolean | null | undefined | void
	type PrimitiveElementChild = Node | Primitive
	type ElementChild = PrimitiveElementChild | Property<Primitive>
	type ElementChildren = ElementChild | readonly ElementChild[]

	// readonly ElementChildren[] allows passing {props.children} directly to native elements as content
	type NativeElementChildren = ElementChildren | readonly ElementChildren[]

	//#region TypeScript
	type Element = PrimitiveElementChild
	interface ElementChildrenAttribute {
		children: unknown
	}
	interface ElementAttributesProperty {
		props: unknown
	}
	//#endregion

	type Booleanish = boolean | 'true' | 'false'
	type Propertify<Target> = { [P in keyof Target]: Target | Property<Target> }

	//#region Events

	type TargetedEvent<Target, TypedEvent extends Event> = Omit<TypedEvent, 'currentTarget'> & {
		readonly currentTarget: Target
	}

	interface ClipboardEvent<Target> extends TargetedEvent<Target, NativeClipboardEvent> {
		clipboardData: DataTransfer
	}

	interface CompositionEvent<Target> extends TargetedEvent<Target, NativeCompositionEvent> {
		data: string
	}

	interface DragEvent<Target> extends MouseEvent<Target, NativeDragEvent> {
		dataTransfer: DataTransfer
	}

	interface PointerEvent<Target> extends MouseEvent<Target, NativePointerEvent> {
		pointerId: number
		pressure: number
		tangentialPressure: number
		tiltX: number
		tiltY: number
		twist: number
		width: number
		height: number
		pointerType: 'mouse' | 'pen' | 'touch'
		isPrimary: boolean
	}

	interface FocusEvent<Target, RelatedTarget> extends Omit<TargetedEvent<Target, NativeFocusEvent>, 'relatedTarget'> {
		relatedTarget: (EventTarget & RelatedTarget) | null
	}

	interface FormEvent<Target> extends TargetedEvent<Target, Event> {}

	interface ChangeEvent<Target> extends TargetedEvent<Target, Event> {}

	interface KeyboardEvent<Target> extends TargetedEvent<Target, NativeKeyboardEvent> {
		altKey: boolean
		/** @deprecated */
		charCode: number
		ctrlKey: boolean
		code: string
		/**
		 * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
		 */
		getModifierState(key: string): boolean
		/**
		 * See the [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#named-key-attribute-values). for possible values
		 */
		key: string
		/** @deprecated */
		keyCode: number
		locale: string
		location: number
		metaKey: boolean
		repeat: boolean
		shiftKey: boolean
		/** @deprecated */
		which: number
	}

	type MouseEvent<Target, TypedEvent extends NativeMouseEvent> = Omit<
		UIEvent<Target, TypedEvent>,
		'relatedTarget'
	> & {
		altKey: boolean
		button: number
		buttons: number
		clientX: number
		clientY: number
		ctrlKey: boolean
		/**
		 * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
		 */
		getModifierState(key: string): boolean
		metaKey: boolean
		movementX: number
		movementY: number
		pageX: number
		pageY: number
		relatedTarget: EventTarget | null
		screenX: number
		screenY: number
		shiftKey: boolean
	}

	interface TouchEvent<Target> extends UIEvent<Target, NativeTouchEvent> {
		altKey: boolean
		changedTouches: TouchList
		ctrlKey: boolean
		/**
		 * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
		 */
		getModifierState(key: string): boolean
		metaKey: boolean
		shiftKey: boolean
		targetTouches: TouchList
		touches: TouchList
	}

	type UIEvent<Target, TypedEvent extends NativeUIEvent> = TargetedEvent<Target, TypedEvent> & {
		detail: number
		view: AbstractView
	}

	interface WheelEvent<Target> extends MouseEvent<Target, NativeWheelEvent> {
		deltaMode: number
		deltaX: number
		deltaY: number
		deltaZ: number
	}

	interface AnimationEvent<Target> extends TargetedEvent<Target, NativeAnimationEvent> {
		animationName: string
		elapsedTime: number
		pseudoElement: string
	}

	interface TransitionEvent<Target> extends TargetedEvent<Target, NativeTransitionEvent> {
		elapsedTime: number
		propertyName: string
		pseudoElement: string
	}

	//
	// Event Handler Types
	// ----------------------------------------------------------------------

	type EventHandler<Target, E extends TargetedEvent<Target, Event>> = {
		bivarianceHack(event: E): void
	}['bivarianceHack']

	type GenericEventHandler<Target> = EventHandler<Target, TargetedEvent<Target, Event>>

	type ClipboardEventHandler<Target> = EventHandler<Target, ClipboardEvent<Target>>
	type CompositionEventHandler<Target> = EventHandler<Target, CompositionEvent<Target>>
	type DragEventHandler<Target> = EventHandler<Target, DragEvent<Target>>
	type FocusEventHandler<Target> = EventHandler<Target, FocusEvent<Target, EventTarget>>
	type FormEventHandler<Target> = EventHandler<Target, FormEvent<Target>>
	type ChangeEventHandler<Target> = EventHandler<Target, ChangeEvent<Target>>
	type KeyboardEventHandler<Target> = EventHandler<Target, KeyboardEvent<Target>>
	type MouseEventHandler<Target> = EventHandler<Target, MouseEvent<Target, NativeMouseEvent>>
	type TouchEventHandler<Target> = EventHandler<Target, TouchEvent<Target>>
	type PointerEventHandler<Target> = EventHandler<Target, PointerEvent<Target>>
	type UIEventHandler<Target> = EventHandler<Target, UIEvent<Target, NativeUIEvent>>
	type WheelEventHandler<Target> = EventHandler<Target, WheelEvent<Target>>
	type AnimationEventHandler<Target> = EventHandler<Target, AnimationEvent<Target>>
	type TransitionEventHandler<Target> = EventHandler<Target, TransitionEvent<Target>>

	//#endregion

	//#region Browser Interfaces
	interface AbstractView {
		styleMedia: StyleMedia
		document: Document
	}
	//#endregion

	interface DOMAttributes<Target> {
		children?: NativeElementChildren
		// Clipboard Events
		onCopy?: ClipboardEventHandler<Target> | undefined
		onCopyCapture?: ClipboardEventHandler<Target> | undefined
		onCut?: ClipboardEventHandler<Target> | undefined
		onCutCapture?: ClipboardEventHandler<Target> | undefined
		onPaste?: ClipboardEventHandler<Target> | undefined
		onPasteCapture?: ClipboardEventHandler<Target> | undefined

		// Composition Events
		onCompositionEnd?: CompositionEventHandler<Target> | undefined
		onCompositionEndCapture?: CompositionEventHandler<Target> | undefined
		onCompositionStart?: CompositionEventHandler<Target> | undefined
		onCompositionStartCapture?: CompositionEventHandler<Target> | undefined
		onCompositionUpdate?: CompositionEventHandler<Target> | undefined
		onCompositionUpdateCapture?: CompositionEventHandler<Target> | undefined

		// Focus Events
		onFocus?: FocusEventHandler<Target> | undefined
		onFocusCapture?: FocusEventHandler<Target> | undefined
		onBlur?: FocusEventHandler<Target> | undefined
		onBlurCapture?: FocusEventHandler<Target> | undefined

		// Form Events
		onChange?: FormEventHandler<Target> | undefined
		onChangeCapture?: FormEventHandler<Target> | undefined
		onBeforeInput?: FormEventHandler<Target> | undefined
		onBeforeInputCapture?: FormEventHandler<Target> | undefined
		onInput?: FormEventHandler<Target> | undefined
		onInputCapture?: FormEventHandler<Target> | undefined
		onReset?: FormEventHandler<Target> | undefined
		onResetCapture?: FormEventHandler<Target> | undefined
		onSubmit?: FormEventHandler<Target> | undefined
		onSubmitCapture?: FormEventHandler<Target> | undefined
		onInvalid?: FormEventHandler<Target> | undefined
		onInvalidCapture?: FormEventHandler<Target> | undefined

		// Image Events
		onLoad?: GenericEventHandler<Target> | undefined
		onLoadCapture?: GenericEventHandler<Target> | undefined
		onError?: GenericEventHandler<Target> | undefined // also a Media Event
		onErrorCapture?: GenericEventHandler<Target> | undefined // also a Media Event

		// Keyboard Events
		onKeyDown?: KeyboardEventHandler<Target> | undefined
		onKeyDownCapture?: KeyboardEventHandler<Target> | undefined
		onKeyPress?: KeyboardEventHandler<Target> | undefined
		onKeyPressCapture?: KeyboardEventHandler<Target> | undefined
		onKeyUp?: KeyboardEventHandler<Target> | undefined
		onKeyUpCapture?: KeyboardEventHandler<Target> | undefined

		// Media Events
		onAbort?: GenericEventHandler<Target> | undefined
		onAbortCapture?: GenericEventHandler<Target> | undefined
		onCanPlay?: GenericEventHandler<Target> | undefined
		onCanPlayCapture?: GenericEventHandler<Target> | undefined
		onCanPlayThrough?: GenericEventHandler<Target> | undefined
		onCanPlayThroughCapture?: GenericEventHandler<Target> | undefined
		onDurationChange?: GenericEventHandler<Target> | undefined
		onDurationChangeCapture?: GenericEventHandler<Target> | undefined
		onEmptied?: GenericEventHandler<Target> | undefined
		onEmptiedCapture?: GenericEventHandler<Target> | undefined
		onEncrypted?: GenericEventHandler<Target> | undefined
		onEncryptedCapture?: GenericEventHandler<Target> | undefined
		onEnded?: GenericEventHandler<Target> | undefined
		onEndedCapture?: GenericEventHandler<Target> | undefined
		onLoadedData?: GenericEventHandler<Target> | undefined
		onLoadedDataCapture?: GenericEventHandler<Target> | undefined
		onLoadedMetadata?: GenericEventHandler<Target> | undefined
		onLoadedMetadataCapture?: GenericEventHandler<Target> | undefined
		onLoadStart?: GenericEventHandler<Target> | undefined
		onLoadStartCapture?: GenericEventHandler<Target> | undefined
		onPause?: GenericEventHandler<Target> | undefined
		onPauseCapture?: GenericEventHandler<Target> | undefined
		onPlay?: GenericEventHandler<Target> | undefined
		onPlayCapture?: GenericEventHandler<Target> | undefined
		onPlaying?: GenericEventHandler<Target> | undefined
		onPlayingCapture?: GenericEventHandler<Target> | undefined
		onProgress?: GenericEventHandler<Target> | undefined
		onProgressCapture?: GenericEventHandler<Target> | undefined
		onRateChange?: GenericEventHandler<Target> | undefined
		onRateChangeCapture?: GenericEventHandler<Target> | undefined
		onSeeked?: GenericEventHandler<Target> | undefined
		onSeekedCapture?: GenericEventHandler<Target> | undefined
		onSeeking?: GenericEventHandler<Target> | undefined
		onSeekingCapture?: GenericEventHandler<Target> | undefined
		onStalled?: GenericEventHandler<Target> | undefined
		onStalledCapture?: GenericEventHandler<Target> | undefined
		onSuspend?: GenericEventHandler<Target> | undefined
		onSuspendCapture?: GenericEventHandler<Target> | undefined
		onTimeUpdate?: GenericEventHandler<Target> | undefined
		onTimeUpdateCapture?: GenericEventHandler<Target> | undefined
		onVolumeChange?: GenericEventHandler<Target> | undefined
		onVolumeChangeCapture?: GenericEventHandler<Target> | undefined
		onWaiting?: GenericEventHandler<Target> | undefined
		onWaitingCapture?: GenericEventHandler<Target> | undefined

		// MouseEvents
		onAuxClick?: MouseEventHandler<Target> | undefined
		onAuxClickCapture?: MouseEventHandler<Target> | undefined
		onClick?: MouseEventHandler<Target> | undefined
		onClickCapture?: MouseEventHandler<Target> | undefined
		onContextMenu?: MouseEventHandler<Target> | undefined
		onContextMenuCapture?: MouseEventHandler<Target> | undefined
		onDoubleClick?: MouseEventHandler<Target> | undefined
		onDoubleClickCapture?: MouseEventHandler<Target> | undefined
		onDrag?: DragEventHandler<Target> | undefined
		onDragCapture?: DragEventHandler<Target> | undefined
		onDragEnd?: DragEventHandler<Target> | undefined
		onDragEndCapture?: DragEventHandler<Target> | undefined
		onDragEnter?: DragEventHandler<Target> | undefined
		onDragEnterCapture?: DragEventHandler<Target> | undefined
		onDragExit?: DragEventHandler<Target> | undefined
		onDragExitCapture?: DragEventHandler<Target> | undefined
		onDragLeave?: DragEventHandler<Target> | undefined
		onDragLeaveCapture?: DragEventHandler<Target> | undefined
		onDragOver?: DragEventHandler<Target> | undefined
		onDragOverCapture?: DragEventHandler<Target> | undefined
		onDragStart?: DragEventHandler<Target> | undefined
		onDragStartCapture?: DragEventHandler<Target> | undefined
		onDrop?: DragEventHandler<Target> | undefined
		onDropCapture?: DragEventHandler<Target> | undefined
		onMouseDown?: MouseEventHandler<Target> | undefined
		onMouseDownCapture?: MouseEventHandler<Target> | undefined
		onMouseEnter?: MouseEventHandler<Target> | undefined
		onMouseLeave?: MouseEventHandler<Target> | undefined
		onMouseMove?: MouseEventHandler<Target> | undefined
		onMouseMoveCapture?: MouseEventHandler<Target> | undefined
		onMouseOut?: MouseEventHandler<Target> | undefined
		onMouseOutCapture?: MouseEventHandler<Target> | undefined
		onMouseOver?: MouseEventHandler<Target> | undefined
		onMouseOverCapture?: MouseEventHandler<Target> | undefined
		onMouseUp?: MouseEventHandler<Target> | undefined
		onMouseUpCapture?: MouseEventHandler<Target> | undefined

		// Selection Events
		onSelect?: GenericEventHandler<Target> | undefined
		onSelectCapture?: GenericEventHandler<Target> | undefined

		// Touch Events
		onTouchCancel?: TouchEventHandler<Target> | undefined
		onTouchCancelCapture?: TouchEventHandler<Target> | undefined
		onTouchEnd?: TouchEventHandler<Target> | undefined
		onTouchEndCapture?: TouchEventHandler<Target> | undefined
		onTouchMove?: TouchEventHandler<Target> | undefined
		onTouchMoveCapture?: TouchEventHandler<Target> | undefined
		onTouchStart?: TouchEventHandler<Target> | undefined
		onTouchStartCapture?: TouchEventHandler<Target> | undefined

		// Pointer Events
		onPointerDown?: PointerEventHandler<Target> | undefined
		onPointerDownCapture?: PointerEventHandler<Target> | undefined
		onPointerMove?: PointerEventHandler<Target> | undefined
		onPointerMoveCapture?: PointerEventHandler<Target> | undefined
		onPointerUp?: PointerEventHandler<Target> | undefined
		onPointerUpCapture?: PointerEventHandler<Target> | undefined
		onPointerCancel?: PointerEventHandler<Target> | undefined
		onPointerCancelCapture?: PointerEventHandler<Target> | undefined
		onPointerEnter?: PointerEventHandler<Target> | undefined
		onPointerEnterCapture?: PointerEventHandler<Target> | undefined
		onPointerLeave?: PointerEventHandler<Target> | undefined
		onPointerLeaveCapture?: PointerEventHandler<Target> | undefined
		onPointerOver?: PointerEventHandler<Target> | undefined
		onPointerOverCapture?: PointerEventHandler<Target> | undefined
		onPointerOut?: PointerEventHandler<Target> | undefined
		onPointerOutCapture?: PointerEventHandler<Target> | undefined
		onGotPointerCapture?: PointerEventHandler<Target> | undefined
		onGotPointerCaptureCapture?: PointerEventHandler<Target> | undefined
		onLostPointerCapture?: PointerEventHandler<Target> | undefined
		onLostPointerCaptureCapture?: PointerEventHandler<Target> | undefined

		// UI Events
		onScroll?: UIEventHandler<Target> | undefined
		onScrollCapture?: UIEventHandler<Target> | undefined

		// Wheel Events
		onWheel?: WheelEventHandler<Target> | undefined
		onWheelCapture?: WheelEventHandler<Target> | undefined

		// Animation Events
		onAnimationStart?: AnimationEventHandler<Target> | undefined
		onAnimationStartCapture?: AnimationEventHandler<Target> | undefined
		onAnimationEnd?: AnimationEventHandler<Target> | undefined
		onAnimationEndCapture?: AnimationEventHandler<Target> | undefined
		onAnimationIteration?: AnimationEventHandler<Target> | undefined
		onAnimationIterationCapture?: AnimationEventHandler<Target> | undefined

		// Transition Events
		onTransitionEnd?: TransitionEventHandler<Target> | undefined
		onTransitionEndCapture?: TransitionEventHandler<Target> | undefined
	}

	export interface CSSProperties extends CSS.Properties<string | number> {
		/**
		 * The index signature was removed to enable closed typing for style
		 * using CSSType. You're able to use type assertion or module augmentation
		 * to add properties or an index signature of your own.
		 *
		 * For examples and more information, visit:
		 * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
		 */
	}

	//#region ARIA

	// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
	interface AriaAttributes {
		/** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
		'aria-activedescendant'?: string | undefined
		/** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
		'aria-atomic'?: Booleanish | undefined
		/**
		 * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
		 * presented if they are made.
		 */
		'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | undefined
		/** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
		'aria-busy'?: Booleanish | undefined
		/**
		 * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
		 * @see aria-pressed @see aria-selected.
		 */
		'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | undefined
		/**
		 * Defines the total number of columns in a table, grid, or treegrid.
		 * @see aria-colindex.
		 */
		'aria-colcount'?: number | undefined
		/**
		 * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
		 * @see aria-colcount @see aria-colspan.
		 */
		'aria-colindex'?: number | undefined
		/**
		 * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
		 * @see aria-colindex @see aria-rowspan.
		 */
		'aria-colspan'?: number | undefined
		/**
		 * Identifies the element (or elements) whose contents or presence are controlled by the current element.
		 * @see aria-owns.
		 */
		'aria-controls'?: string | undefined
		/** Indicates the element that represents the current item within a container or set of related elements. */
		'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time' | undefined
		/**
		 * Identifies the element (or elements) that describes the object.
		 * @see aria-labelledby
		 */
		'aria-describedby'?: string | undefined
		/**
		 * Identifies the element that provides a detailed, extended description for the object.
		 * @see aria-describedby.
		 */
		'aria-details'?: string | undefined
		/**
		 * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
		 * @see aria-hidden @see aria-readonly.
		 */
		'aria-disabled'?: Booleanish | undefined
		/**
		 * Indicates what functions can be performed when a dragged object is released on the drop target.
		 * @deprecated in ARIA 1.1
		 */
		'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined
		/**
		 * Identifies the element that provides an error message for the object.
		 * @see aria-invalid @see aria-describedby.
		 */
		'aria-errormessage'?: string | undefined
		/** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
		'aria-expanded'?: Booleanish | undefined
		/**
		 * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
		 * allows assistive technology to override the general default of reading in document source order.
		 */
		'aria-flowto'?: string | undefined
		/**
		 * Indicates an element's "grabbed" state in a drag-and-drop operation.
		 * @deprecated in ARIA 1.1
		 */
		'aria-grabbed'?: Booleanish | undefined
		/** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
		'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | undefined
		/**
		 * Indicates whether the element is exposed to an accessibility API.
		 * @see aria-disabled.
		 */
		'aria-hidden'?: Booleanish | undefined
		/**
		 * Indicates the entered value does not conform to the format expected by the application.
		 * @see aria-errormessage.
		 */
		'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined
		/** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
		'aria-keyshortcuts'?: string | undefined
		/**
		 * Defines a string value that labels the current element.
		 * @see aria-labelledby.
		 */
		'aria-label'?: string | undefined
		/**
		 * Identifies the element (or elements) that labels the current element.
		 * @see aria-describedby.
		 */
		'aria-labelledby'?: string | undefined
		/** Defines the hierarchical level of an element within a structure. */
		'aria-level'?: number | undefined
		/** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
		'aria-live'?: 'off' | 'assertive' | 'polite' | undefined
		/** Indicates whether an element is modal when displayed. */
		'aria-modal'?: Booleanish | undefined
		/** Indicates whether a text box accepts multiple lines of input or only a single line. */
		'aria-multiline'?: Booleanish | undefined
		/** Indicates that the user may select more than one item from the current selectable descendants. */
		'aria-multiselectable'?: Booleanish | undefined
		/** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
		'aria-orientation'?: 'horizontal' | 'vertical' | undefined
		/**
		 * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
		 * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
		 * @see aria-controls.
		 */
		'aria-owns'?: string | undefined
		/**
		 * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
		 * A hint could be a sample value or a brief description of the expected format.
		 */
		'aria-placeholder'?: string | undefined
		/**
		 * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
		 * @see aria-setsize.
		 */
		'aria-posinset'?: number | undefined
		/**
		 * Indicates the current "pressed" state of toggle buttons.
		 * @see aria-checked @see aria-selected.
		 */
		'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | undefined
		/**
		 * Indicates that the element is not editable, but is otherwise operable.
		 * @see aria-disabled.
		 */
		'aria-readonly'?: Booleanish | undefined
		/**
		 * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
		 * @see aria-atomic.
		 */
		'aria-relevant'?:
			| 'additions'
			| 'additions removals'
			| 'additions text'
			| 'all'
			| 'removals'
			| 'removals additions'
			| 'removals text'
			| 'text'
			| 'text additions'
			| 'text removals'
			| undefined
		/** Indicates that user input is required on the element before a form may be submitted. */
		'aria-required'?: Booleanish | undefined
		/** Defines a human-readable, author-localized description for the role of an element. */
		'aria-roledescription'?: string | undefined
		/**
		 * Defines the total number of rows in a table, grid, or treegrid.
		 * @see aria-rowindex.
		 */
		'aria-rowcount'?: number | undefined
		/**
		 * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
		 * @see aria-rowcount @see aria-rowspan.
		 */
		'aria-rowindex'?: number | undefined
		/**
		 * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
		 * @see aria-rowindex @see aria-colspan.
		 */
		'aria-rowspan'?: number | undefined
		/**
		 * Indicates the current "selected" state of various widgets.
		 * @see aria-checked @see aria-pressed.
		 */
		'aria-selected'?: Booleanish | undefined
		/**
		 * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
		 * @see aria-posinset.
		 */
		'aria-setsize'?: number | undefined
		/** Indicates if items in a table or grid are sorted in ascending or descending order. */
		'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | undefined
		/** Defines the maximum allowed value for a range widget. */
		'aria-valuemax'?: number | undefined
		/** Defines the minimum allowed value for a range widget. */
		'aria-valuemin'?: number | undefined
		/**
		 * Defines the current value for a range widget.
		 * @see aria-valuetext.
		 */
		'aria-valuenow'?: number | undefined
		/** Defines the human readable text alternative of aria-valuenow for a range widget. */
		'aria-valuetext'?: string | undefined
	}

	// All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
	type AriaRole =
		| 'alert'
		| 'alertdialog'
		| 'application'
		| 'article'
		| 'banner'
		| 'button'
		| 'cell'
		| 'checkbox'
		| 'columnheader'
		| 'combobox'
		| 'complementary'
		| 'contentinfo'
		| 'definition'
		| 'dialog'
		| 'directory'
		| 'document'
		| 'feed'
		| 'figure'
		| 'form'
		| 'grid'
		| 'gridcell'
		| 'group'
		| 'heading'
		| 'img'
		| 'link'
		| 'list'
		| 'listbox'
		| 'listitem'
		| 'log'
		| 'main'
		| 'marquee'
		| 'math'
		| 'menu'
		| 'menubar'
		| 'menuitem'
		| 'menuitemcheckbox'
		| 'menuitemradio'
		| 'navigation'
		| 'none'
		| 'note'
		| 'option'
		| 'presentation'
		| 'progressbar'
		| 'radio'
		| 'radiogroup'
		| 'region'
		| 'row'
		| 'rowgroup'
		| 'rowheader'
		| 'scrollbar'
		| 'search'
		| 'searchbox'
		| 'separator'
		| 'slider'
		| 'spinbutton'
		| 'status'
		| 'switch'
		| 'tab'
		| 'table'
		| 'tablist'
		| 'tabpanel'
		| 'term'
		| 'textbox'
		| 'timer'
		| 'toolbar'
		| 'tooltip'
		| 'tree'
		| 'treegrid'
		| 'treeitem'
		// eslint-disable-next-line @typescript-eslint/ban-types
		| (string & {})
	//#endregion

	//#region HTML Attributes
	interface HTMLAttributes<Target> extends AriaAttributes, DOMAttributes<Target> {
		// React-specific Attributes
		defaultChecked?: boolean | undefined
		defaultValue?: string | number | ReadonlyArray<string> | undefined
		suppressContentEditableWarning?: boolean | undefined
		suppressHydrationWarning?: boolean | undefined

		// Standard HTML Attributes
		accessKey?: string | undefined
		className?: string | undefined
		contentEditable?: Booleanish | 'inherit' | undefined
		contextMenu?: string | undefined
		dir?: string | undefined
		draggable?: Booleanish | undefined
		hidden?: boolean | undefined
		id?: string | undefined
		lang?: string | undefined
		placeholder?: string | undefined
		slot?: string | undefined
		spellCheck?: Booleanish | undefined
		style?: CSSProperties | undefined | string
		tabIndex?: number | undefined
		title?: string | undefined
		translate?: 'yes' | 'no' | undefined

		// Unknown
		radioGroup?: string | undefined // <command>, <menuitem>

		// WAI-ARIA
		role?: AriaRole | undefined

		// RDFa Attributes
		about?: string | undefined
		datatype?: string | undefined
		inlist?: unknown
		prefix?: string | undefined
		property?: string | undefined
		resource?: string | undefined
		typeof?: string | undefined
		vocab?: string | undefined

		// Non-standard Attributes
		autoCapitalize?: string | undefined
		autoCorrect?: string | undefined
		autoSave?: string | undefined
		color?: string | undefined
		itemProp?: string | undefined
		itemScope?: boolean | undefined
		itemType?: string | undefined
		itemID?: string | undefined
		itemRef?: string | undefined
		results?: number | undefined
		security?: string | undefined
		unselectable?: 'on' | 'off' | undefined

		// Living Standard
		/**
		 * Hints at the type of data that might be entered by the user while editing the element or its contents
		 * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
		 */
		inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined
		/**
		 * Specify that a standard HTML element should behave like a defined custom built-in element
		 * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
		 */
		is?: string | undefined
	}
	//
	// interface AllHTMLAttributes<Target > extends HTMLAttributes<Target> {
	// 	// Standard HTML Attributes
	// 	accept?: string | undefined
	// 	acceptCharset?: string | undefined
	// 	action?: string | undefined
	// 	allowFullScreen?: boolean | undefined
	// 	allowTransparency?: boolean | undefined
	// 	alt?: string | undefined
	// 	as?: string | undefined
	// 	async?: boolean | undefined
	// 	autoComplete?: string | undefined
	// 	autoFocus?: boolean | undefined
	// 	autoPlay?: boolean | undefined
	// 	capture?: boolean | 'user' | 'environment' | undefined
	// 	cellPadding?: number | string | undefined
	// 	cellSpacing?: number | string | undefined
	// 	charSet?: string | undefined
	// 	challenge?: string | undefined
	// 	checked?: boolean | undefined
	// 	cite?: string | undefined
	// 	classID?: string | undefined
	// 	cols?: number | undefined
	// 	colSpan?: number | undefined
	// 	content?: string | undefined
	// 	controls?: boolean | undefined
	// 	coords?: string | undefined
	// 	crossOrigin?: string | undefined
	// 	data?: string | undefined
	// 	dateTime?: string | undefined
	// 	default?: boolean | undefined
	// 	defer?: boolean | undefined
	// 	disabled?: boolean | undefined
	// 	download?: unknown
	// 	encType?: string | undefined
	// 	form?: string | undefined
	// 	formAction?: string | undefined
	// 	formEncType?: string | undefined
	// 	formMethod?: string | undefined
	// 	formNoValidate?: boolean | undefined
	// 	formTarget?: string | undefined
	// 	frameBorder?: number | string | undefined
	// 	headers?: string | undefined
	// 	height?: number | string | undefined
	// 	high?: number | undefined
	// 	href?: string | undefined
	// 	hrefLang?: string | undefined
	// 	htmlFor?: string | undefined
	// 	httpEquiv?: string | undefined
	// 	integrity?: string | undefined
	// 	keyParams?: string | undefined
	// 	keyType?: string | undefined
	// 	kind?: string | undefined
	// 	label?: string | undefined
	// 	list?: string | undefined
	// 	loop?: boolean | undefined
	// 	low?: number | undefined
	// 	manifest?: string | undefined
	// 	marginHeight?: number | undefined
	// 	marginWidth?: number | undefined
	// 	max?: number | string | undefined
	// 	maxLength?: number | undefined
	// 	media?: string | undefined
	// 	mediaGroup?: string | undefined
	// 	method?: string | undefined
	// 	min?: number | string | undefined
	// 	minLength?: number | undefined
	// 	multiple?: boolean | undefined
	// 	muted?: boolean | undefined
	// 	name?: string | undefined
	// 	nonce?: string | undefined
	// 	noValidate?: boolean | undefined
	// 	open?: boolean | undefined
	// 	optimum?: number | undefined
	// 	pattern?: string | undefined
	// 	placeholder?: string | undefined
	// 	playsInline?: boolean | undefined
	// 	poster?: string | undefined
	// 	preload?: string | undefined
	// 	readOnly?: boolean | undefined
	// 	rel?: string | undefined
	// 	required?: boolean | undefined
	// 	reversed?: boolean | undefined
	// 	rows?: number | undefined
	// 	rowSpan?: number | undefined
	// 	sandbox?: string | undefined
	// 	scope?: string | undefined
	// 	scoped?: boolean | undefined
	// 	scrolling?: string | undefined
	// 	seamless?: boolean | undefined
	// 	selected?: boolean | undefined
	// 	shape?: string | undefined
	// 	size?: number | undefined
	// 	sizes?: string | undefined
	// 	span?: number | undefined
	// 	src?: string | undefined
	// 	srcDoc?: string | undefined
	// 	srcLang?: string | undefined
	// 	srcSet?: string | undefined
	// 	start?: number | undefined
	// 	step?: number | string | undefined
	// 	summary?: string | undefined
	// 	target?: string | undefined
	// 	type?: string | undefined
	// 	useMap?: string | undefined
	// 	value?: string | ReadonlyArray<string> | number | undefined
	// 	width?: number | string | undefined
	// 	wmode?: string | undefined
	// 	wrap?: string | undefined
	// }
	//#endregion

	//#region HTML Element Attributes
	type HTMLAttributeReferrerPolicy =
		| ''
		| 'no-referrer'
		| 'no-referrer-when-downgrade'
		| 'origin'
		| 'origin-when-cross-origin'
		| 'same-origin'
		| 'strict-origin'
		| 'strict-origin-when-cross-origin'
		| 'unsafe-url'

	// eslint-disable-next-line @typescript-eslint/ban-types
	type HTMLAttributeAnchorTarget = '_self' | '_blank' | '_parent' | '_top' | (string & {})

	interface AnchorHTMLAttributes<Target> extends HTMLAttributes<Target> {
		download?: unknown
		href?: string | undefined
		hrefLang?: string | undefined
		media?: string | undefined
		ping?: string | undefined
		rel?: string | undefined
		target?: HTMLAttributeAnchorTarget | undefined
		type?: string | undefined
		referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
	}

	interface AudioHTMLAttributes<Target> extends MediaHTMLAttributes<Target> {}

	interface AreaHTMLAttributes<Target> extends HTMLAttributes<Target> {
		alt?: string | undefined
		coords?: string | undefined
		download?: unknown
		href?: string | undefined
		hrefLang?: string | undefined
		media?: string | undefined
		referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
		rel?: string | undefined
		shape?: string | undefined
		target?: string | undefined
	}

	interface BaseHTMLAttributes<Target> extends HTMLAttributes<Target> {
		href?: string | undefined
		target?: string | undefined
	}

	interface BlockquoteHTMLAttributes<Target> extends HTMLAttributes<Target> {
		cite?: string | undefined
	}

	interface ButtonHTMLAttributes<Target> extends HTMLAttributes<Target> {
		autoFocus?: boolean | undefined
		disabled?: boolean | undefined
		form?: string | undefined
		formAction?: string | undefined
		formEncType?: string | undefined
		formMethod?: string | undefined
		formNoValidate?: boolean | undefined
		formTarget?: string | undefined
		name?: string | undefined
		type?: 'submit' | 'reset' | 'button' | undefined
		value?: string | ReadonlyArray<string> | number | undefined
	}

	interface CanvasHTMLAttributes<Target> extends HTMLAttributes<Target> {
		height?: number | string | undefined
		width?: number | string | undefined
	}

	interface ColHTMLAttributes<Target> extends HTMLAttributes<Target> {
		span?: number | undefined
		width?: number | string | undefined
	}

	interface ColgroupHTMLAttributes<Target> extends HTMLAttributes<Target> {
		span?: number | undefined
	}

	interface DataHTMLAttributes<Target> extends HTMLAttributes<Target> {
		value?: string | ReadonlyArray<string> | number | undefined
	}

	interface DetailsHTMLAttributes<Target> extends HTMLAttributes<Target> {
		open?: boolean | undefined
		onToggle?: GenericEventHandler<Target> | undefined
	}

	interface DelHTMLAttributes<Target> extends HTMLAttributes<Target> {
		cite?: string | undefined
		dateTime?: string | undefined
	}

	interface DialogHTMLAttributes<Target> extends HTMLAttributes<Target> {
		open?: boolean | undefined
	}

	interface EmbedHTMLAttributes<Target> extends HTMLAttributes<Target> {
		height?: number | string | undefined
		src?: string | undefined
		type?: string | undefined
		width?: number | string | undefined
	}

	interface FieldsetHTMLAttributes<Target> extends HTMLAttributes<Target> {
		disabled?: boolean | undefined
		form?: string | undefined
		name?: string | undefined
	}

	interface FormHTMLAttributes<Target> extends HTMLAttributes<Target> {
		acceptCharset?: string | undefined
		action?: string | undefined
		autoComplete?: string | undefined
		encType?: string | undefined
		method?: string | undefined
		name?: string | undefined
		noValidate?: boolean | undefined
		target?: string | undefined
	}

	interface HtmlHTMLAttributes<Target> extends HTMLAttributes<Target> {
		manifest?: string | undefined
	}

	interface IframeHTMLAttributes<Target> extends HTMLAttributes<Target> {
		allow?: string | undefined
		allowFullScreen?: boolean | undefined
		allowTransparency?: boolean | undefined
		/** @deprecated */
		frameBorder?: number | string | undefined
		height?: number | string | undefined
		loading?: 'eager' | 'lazy' | undefined
		/** @deprecated */
		marginHeight?: number | undefined
		/** @deprecated */
		marginWidth?: number | undefined
		name?: string | undefined
		referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
		sandbox?: string | undefined
		/** @deprecated */
		scrolling?: string | undefined
		seamless?: boolean | undefined
		src?: string | undefined
		srcDoc?: string | undefined
		width?: number | string | undefined
	}

	interface ImgHTMLAttributes<Target> extends HTMLAttributes<Target> {
		alt?: string | undefined
		crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined
		decoding?: 'async' | 'auto' | 'sync' | undefined
		height?: number | string | undefined
		loading?: 'eager' | 'lazy' | undefined
		referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
		sizes?: string | undefined
		src?: string | undefined
		srcSet?: string | undefined
		useMap?: string | undefined
		width?: number | string | undefined
	}

	interface InsHTMLAttributes<Target> extends HTMLAttributes<Target> {
		cite?: string | undefined
		dateTime?: string | undefined
	}

	type HTMLInputTypeAttribute =
		| 'button'
		| 'checkbox'
		| 'color'
		| 'date'
		| 'datetime-local'
		| 'email'
		| 'file'
		| 'hidden'
		| 'image'
		| 'month'
		| 'number'
		| 'password'
		| 'radio'
		| 'range'
		| 'reset'
		| 'search'
		| 'submit'
		| 'tel'
		| 'text'
		| 'time'
		| 'url'
		| 'week'
		// eslint-disable-next-line @typescript-eslint/ban-types
		| (string & {})

	interface InputHTMLAttributes<Target> extends HTMLAttributes<Target> {
		accept?: string | undefined
		alt?: string | undefined
		autoComplete?: string | undefined
		autoFocus?: boolean | undefined
		capture?: boolean | 'user' | 'environment' | undefined // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
		checked?: boolean | undefined
		crossOrigin?: string | undefined
		disabled?: boolean | undefined
		enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | undefined
		form?: string | undefined
		formAction?: string | undefined
		formEncType?: string | undefined
		formMethod?: string | undefined
		formNoValidate?: boolean | undefined
		formTarget?: string | undefined
		height?: number | string | undefined
		list?: string | undefined
		max?: number | string | undefined
		maxLength?: number | undefined
		min?: number | string | undefined
		minLength?: number | undefined
		multiple?: boolean | undefined
		name?: string | undefined
		pattern?: string | undefined
		placeholder?: string | undefined
		readOnly?: boolean | undefined
		required?: boolean | undefined
		size?: number | undefined
		src?: string | undefined
		step?: number | string | undefined
		type?: HTMLInputTypeAttribute | undefined
		value?: string | ReadonlyArray<string> | number | undefined
		width?: number | string | undefined

		onChange?: ChangeEventHandler<Target> | undefined
	}

	interface KeygenHTMLAttributes<Target> extends HTMLAttributes<Target> {
		autoFocus?: boolean | undefined
		challenge?: string | undefined
		disabled?: boolean | undefined
		form?: string | undefined
		keyType?: string | undefined
		keyParams?: string | undefined
		name?: string | undefined
	}

	interface LabelHTMLAttributes<Target> extends HTMLAttributes<Target> {
		form?: string | undefined
		htmlFor?: string | undefined
	}

	interface LiHTMLAttributes<Target> extends HTMLAttributes<Target> {
		value?: string | ReadonlyArray<string> | number | undefined
	}

	interface LinkHTMLAttributes<Target> extends HTMLAttributes<Target> {
		as?: string | undefined
		crossOrigin?: string | undefined
		href?: string | undefined
		hrefLang?: string | undefined
		integrity?: string | undefined
		media?: string | undefined
		imageSrcSet?: string | undefined
		referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
		rel?: string | undefined
		sizes?: string | undefined
		type?: string | undefined
		charSet?: string | undefined
	}

	interface MapHTMLAttributes<Target> extends HTMLAttributes<Target> {
		name?: string | undefined
	}

	interface MenuHTMLAttributes<Target> extends HTMLAttributes<Target> {
		type?: string | undefined
	}

	interface MediaHTMLAttributes<Target> extends HTMLAttributes<Target> {
		autoPlay?: boolean | undefined
		controls?: boolean | undefined
		controlsList?: string | undefined
		crossOrigin?: string | undefined
		loop?: boolean | undefined
		mediaGroup?: string | undefined
		muted?: boolean | undefined
		playsInline?: boolean | undefined
		preload?: string | undefined
		src?: string | undefined
	}

	interface MetaHTMLAttributes<Target> extends HTMLAttributes<Target> {
		charSet?: string | undefined
		content?: string | undefined
		httpEquiv?: string | undefined
		name?: string | undefined
		media?: string | undefined
	}

	interface MeterHTMLAttributes<Target> extends HTMLAttributes<Target> {
		form?: string | undefined
		high?: number | undefined
		low?: number | undefined
		max?: number | string | undefined
		min?: number | string | undefined
		optimum?: number | undefined
		value?: string | ReadonlyArray<string> | number | undefined
	}

	interface QuoteHTMLAttributes<Target> extends HTMLAttributes<Target> {
		cite?: string | undefined
	}

	interface ObjectHTMLAttributes<Target> extends HTMLAttributes<Target> {
		classID?: string | undefined
		data?: string | undefined
		form?: string | undefined
		height?: number | string | undefined
		name?: string | undefined
		type?: string | undefined
		useMap?: string | undefined
		width?: number | string | undefined
		wmode?: string | undefined
	}

	interface OlHTMLAttributes<Target> extends HTMLAttributes<Target> {
		reversed?: boolean | undefined
		start?: number | undefined
		type?: '1' | 'a' | 'A' | 'i' | 'I' | undefined
	}

	interface OptgroupHTMLAttributes<Target> extends HTMLAttributes<Target> {
		disabled?: boolean | undefined
		label?: string | undefined
	}

	interface OptionHTMLAttributes<Target> extends HTMLAttributes<Target> {
		disabled?: boolean | undefined
		label?: string | undefined
		selected?: boolean | undefined
		value?: string | ReadonlyArray<string> | number | undefined
	}

	interface OutputHTMLAttributes<Target> extends HTMLAttributes<Target> {
		form?: string | undefined
		htmlFor?: string | undefined
		name?: string | undefined
	}

	interface ParamHTMLAttributes<Target> extends HTMLAttributes<Target> {
		name?: string | undefined
		value?: string | ReadonlyArray<string> | number | undefined
	}

	interface ProgressHTMLAttributes<Target> extends HTMLAttributes<Target> {
		max?: number | string | undefined
		value?: string | ReadonlyArray<string> | number | undefined
	}

	interface SlotHTMLAttributes<Target> extends HTMLAttributes<Target> {
		name?: string | undefined
	}

	interface ScriptHTMLAttributes<Target> extends HTMLAttributes<Target> {
		async?: boolean | undefined
		/** @deprecated */
		charSet?: string | undefined
		crossOrigin?: string | undefined
		defer?: boolean | undefined
		integrity?: string | undefined
		noModule?: boolean | undefined
		nonce?: string | undefined
		referrerPolicy?: HTMLAttributeReferrerPolicy | undefined
		src?: string | undefined
		type?: string | undefined
	}

	interface SelectHTMLAttributes<Target> extends HTMLAttributes<Target> {
		autoComplete?: string | undefined
		autoFocus?: boolean | undefined
		disabled?: boolean | undefined
		form?: string | undefined
		multiple?: boolean | undefined
		name?: string | undefined
		required?: boolean | undefined
		size?: number | undefined
		value?: string | ReadonlyArray<string> | number | undefined
		onChange?: ChangeEventHandler<Target> | undefined
	}

	interface SourceHTMLAttributes<Target> extends HTMLAttributes<Target> {
		height?: number | string | undefined
		media?: string | undefined
		sizes?: string | undefined
		src?: string | undefined
		srcSet?: string | undefined
		type?: string | undefined
		width?: number | string | undefined
	}

	interface StyleHTMLAttributes<Target> extends HTMLAttributes<Target> {
		media?: string | undefined
		nonce?: string | undefined
		scoped?: boolean | undefined
		type?: string | undefined
	}

	interface TableHTMLAttributes<Target> extends HTMLAttributes<Target> {
		cellPadding?: number | string | undefined
		cellSpacing?: number | string | undefined
		summary?: string | undefined
		width?: number | string | undefined
	}

	interface TextareaHTMLAttributes<Target> extends HTMLAttributes<Target> {
		autoComplete?: string | undefined
		autoFocus?: boolean | undefined
		cols?: number | undefined
		dirName?: string | undefined
		disabled?: boolean | undefined
		form?: string | undefined
		maxLength?: number | undefined
		minLength?: number | undefined
		name?: string | undefined
		placeholder?: string | undefined
		readOnly?: boolean | undefined
		required?: boolean | undefined
		rows?: number | undefined
		value?: string | ReadonlyArray<string> | number | undefined
		wrap?: string | undefined

		onChange?: ChangeEventHandler<Target> | undefined
	}

	interface TdHTMLAttributes<Target> extends HTMLAttributes<Target> {
		align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined
		colSpan?: number | undefined
		headers?: string | undefined
		rowSpan?: number | undefined
		scope?: string | undefined
		abbr?: string | undefined
		height?: number | string | undefined
		width?: number | string | undefined
		valign?: 'top' | 'middle' | 'bottom' | 'baseline' | undefined
	}

	interface ThHTMLAttributes<Target> extends HTMLAttributes<Target> {
		align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined
		colSpan?: number | undefined
		headers?: string | undefined
		rowSpan?: number | undefined
		scope?: string | undefined
		abbr?: string | undefined
	}

	interface TimeHTMLAttributes<Target> extends HTMLAttributes<Target> {
		dateTime?: string | undefined
	}

	interface TrackHTMLAttributes<Target> extends HTMLAttributes<Target> {
		default?: boolean | undefined
		kind?: string | undefined
		label?: string | undefined
		src?: string | undefined
		srcLang?: string | undefined
	}

	interface VideoHTMLAttributes<Target> extends MediaHTMLAttributes<Target> {
		height?: number | string | undefined
		playsInline?: boolean | undefined
		poster?: string | undefined
		width?: number | string | undefined
		disablePictureInPicture?: boolean | undefined
		disableRemotePlayback?: boolean | undefined
	}

	interface WebViewHTMLAttributes<T> extends HTMLAttributes<T> {
		allowFullScreen?: boolean | undefined
		allowpopups?: boolean | undefined
		autoFocus?: boolean | undefined
		autosize?: boolean | undefined
		blinkfeatures?: string | undefined
		disableblinkfeatures?: string | undefined
		disableguestresize?: boolean | undefined
		disablewebsecurity?: boolean | undefined
		guestinstance?: string | undefined
		httpreferrer?: string | undefined
		nodeintegration?: boolean | undefined
		partition?: string | undefined
		plugins?: boolean | undefined
		preload?: string | undefined
		src?: string | undefined
		useragent?: string | undefined
		webpreferences?: string | undefined
	}
	//#endregion

	//#region SVG
	// this list is "complete" in that it contains every SVG attribute
	// that React supports, but the types can be improved.
	// Full list here: https://facebook.github.io/react/docs/dom-elements.html
	//
	// The three broad type categories are (in order of restrictiveness):
	//   - "number | string"
	//   - "string"
	//   - union of string literals
	interface SVGAttributes<Target> extends AriaAttributes, DOMAttributes<Target> {
		// Attributes which also defined in HTMLAttributes
		// See comment in SVGDOMPropertyConfig.js
		className?: string | undefined
		color?: string | undefined
		height?: number | string | undefined
		id?: string | undefined
		lang?: string | undefined
		max?: number | string | undefined
		media?: string | undefined
		method?: string | undefined
		min?: number | string | undefined
		name?: string | undefined
		style?: CSSProperties | undefined | string
		target?: string | undefined
		type?: string | undefined
		width?: number | string | undefined

		// Other HTML properties supported by SVG elements in browsers
		role?: AriaRole | undefined
		tabIndex?: number | undefined
		crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined

		// SVG Specific attributes
		accentHeight?: number | string | undefined
		accumulate?: 'none' | 'sum' | undefined
		additive?: 'replace' | 'sum' | undefined
		alignmentBaseline?:
			| 'auto'
			| 'baseline'
			| 'before-edge'
			| 'text-before-edge'
			| 'middle'
			| 'central'
			| 'after-edge'
			| 'text-after-edge'
			| 'ideographic'
			| 'alphabetic'
			| 'hanging'
			| 'mathematical'
			| 'inherit'
			| undefined
		allowReorder?: 'no' | 'yes' | undefined
		alphabetic?: number | string | undefined
		amplitude?: number | string | undefined
		arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated' | undefined
		ascent?: number | string | undefined
		attributeName?: string | undefined
		attributeType?: string | undefined
		autoReverse?: Booleanish | undefined
		azimuth?: number | string | undefined
		baseFrequency?: number | string | undefined
		baselineShift?: number | string | undefined
		baseProfile?: number | string | undefined
		bbox?: number | string | undefined
		begin?: number | string | undefined
		bias?: number | string | undefined
		by?: number | string | undefined
		calcMode?: number | string | undefined
		capHeight?: number | string | undefined
		clip?: number | string | undefined
		clipPath?: string | undefined
		clipPathUnits?: number | string | undefined
		clipRule?: number | string | undefined
		colorInterpolation?: number | string | undefined
		colorInterpolationFilters?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit' | undefined
		colorProfile?: number | string | undefined
		colorRendering?: number | string | undefined
		contentScriptType?: number | string | undefined
		contentStyleType?: number | string | undefined
		cursor?: number | string | undefined
		cx?: number | string | undefined
		cy?: number | string | undefined
		d?: string | undefined
		decelerate?: number | string | undefined
		descent?: number | string | undefined
		diffuseConstant?: number | string | undefined
		direction?: number | string | undefined
		display?: number | string | undefined
		divisor?: number | string | undefined
		dominantBaseline?: number | string | undefined
		dur?: number | string | undefined
		dx?: number | string | undefined
		dy?: number | string | undefined
		edgeMode?: number | string | undefined
		elevation?: number | string | undefined
		enableBackground?: number | string | undefined
		end?: number | string | undefined
		exponent?: number | string | undefined
		externalResourcesRequired?: Booleanish | undefined
		fill?: string | undefined
		fillOpacity?: number | string | undefined
		fillRule?: 'nonzero' | 'evenodd' | 'inherit' | undefined
		filter?: string | undefined
		filterRes?: number | string | undefined
		filterUnits?: number | string | undefined
		floodColor?: number | string | undefined
		floodOpacity?: number | string | undefined
		focusable?: Booleanish | 'auto' | undefined
		fontFamily?: string | undefined
		fontSize?: number | string | undefined
		fontSizeAdjust?: number | string | undefined
		fontStretch?: number | string | undefined
		fontStyle?: number | string | undefined
		fontVariant?: number | string | undefined
		fontWeight?: number | string | undefined
		format?: number | string | undefined
		fr?: number | string | undefined
		from?: number | string | undefined
		fx?: number | string | undefined
		fy?: number | string | undefined
		g1?: number | string | undefined
		g2?: number | string | undefined
		glyphName?: number | string | undefined
		glyphOrientationHorizontal?: number | string | undefined
		glyphOrientationVertical?: number | string | undefined
		glyphRef?: number | string | undefined
		gradientTransform?: string | undefined
		gradientUnits?: string | undefined
		hanging?: number | string | undefined
		horizAdvX?: number | string | undefined
		horizOriginX?: number | string | undefined
		href?: string | undefined
		ideographic?: number | string | undefined
		imageRendering?: number | string | undefined
		in2?: number | string | undefined
		in?: string | undefined
		intercept?: number | string | undefined
		k1?: number | string | undefined
		k2?: number | string | undefined
		k3?: number | string | undefined
		k4?: number | string | undefined
		k?: number | string | undefined
		kernelMatrix?: number | string | undefined
		kernelUnitLength?: number | string | undefined
		kerning?: number | string | undefined
		keyPoints?: number | string | undefined
		keySplines?: number | string | undefined
		keyTimes?: number | string | undefined
		lengthAdjust?: number | string | undefined
		letterSpacing?: number | string | undefined
		lightingColor?: number | string | undefined
		limitingConeAngle?: number | string | undefined
		local?: number | string | undefined
		markerEnd?: string | undefined
		markerHeight?: number | string | undefined
		markerMid?: string | undefined
		markerStart?: string | undefined
		markerUnits?: number | string | undefined
		markerWidth?: number | string | undefined
		mask?: string | undefined
		maskContentUnits?: number | string | undefined
		maskUnits?: number | string | undefined
		mathematical?: number | string | undefined
		mode?: number | string | undefined
		numOctaves?: number | string | undefined
		offset?: number | string | undefined
		opacity?: number | string | undefined
		operator?: number | string | undefined
		order?: number | string | undefined
		orient?: number | string | undefined
		orientation?: number | string | undefined
		origin?: number | string | undefined
		overflow?: number | string | undefined
		overlinePosition?: number | string | undefined
		overlineThickness?: number | string | undefined
		paintOrder?: number | string | undefined
		panose1?: number | string | undefined
		path?: string | undefined
		pathLength?: number | string | undefined
		patternContentUnits?: string | undefined
		patternTransform?: number | string | undefined
		patternUnits?: string | undefined
		pointerEvents?: number | string | undefined
		points?: string | undefined
		pointsAtX?: number | string | undefined
		pointsAtY?: number | string | undefined
		pointsAtZ?: number | string | undefined
		preserveAlpha?: Booleanish | undefined
		preserveAspectRatio?: string | undefined
		primitiveUnits?: number | string | undefined
		r?: number | string | undefined
		radius?: number | string | undefined
		refX?: number | string | undefined
		refY?: number | string | undefined
		renderingIntent?: number | string | undefined
		repeatCount?: number | string | undefined
		repeatDur?: number | string | undefined
		requiredExtensions?: number | string | undefined
		requiredFeatures?: number | string | undefined
		restart?: number | string | undefined
		result?: string | undefined
		rotate?: number | string | undefined
		rx?: number | string | undefined
		ry?: number | string | undefined
		scale?: number | string | undefined
		seed?: number | string | undefined
		shapeRendering?: number | string | undefined
		slope?: number | string | undefined
		spacing?: number | string | undefined
		specularConstant?: number | string | undefined
		specularExponent?: number | string | undefined
		speed?: number | string | undefined
		spreadMethod?: string | undefined
		startOffset?: number | string | undefined
		stdDeviation?: number | string | undefined
		stemh?: number | string | undefined
		stemv?: number | string | undefined
		stitchTiles?: number | string | undefined
		stopColor?: string | undefined
		stopOpacity?: number | string | undefined
		strikethroughPosition?: number | string | undefined
		strikethroughThickness?: number | string | undefined
		string?: number | string | undefined
		stroke?: string | undefined
		strokeDasharray?: string | number | undefined
		strokeDashoffset?: string | number | undefined
		strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit' | undefined
		strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit' | undefined
		strokeMiterlimit?: number | string | undefined
		strokeOpacity?: number | string | undefined
		strokeWidth?: number | string | undefined
		surfaceScale?: number | string | undefined
		systemLanguage?: number | string | undefined
		tableValues?: number | string | undefined
		targetX?: number | string | undefined
		targetY?: number | string | undefined
		textAnchor?: string | undefined
		textDecoration?: number | string | undefined
		textLength?: number | string | undefined
		textRendering?: number | string | undefined
		to?: number | string | undefined
		transform?: string | undefined
		u1?: number | string | undefined
		u2?: number | string | undefined
		underlinePosition?: number | string | undefined
		underlineThickness?: number | string | undefined
		unicode?: number | string | undefined
		unicodeBidi?: number | string | undefined
		unicodeRange?: number | string | undefined
		unitsPerEm?: number | string | undefined
		vAlphabetic?: number | string | undefined
		values?: string | undefined
		vectorEffect?: number | string | undefined
		version?: string | undefined
		vertAdvY?: number | string | undefined
		vertOriginX?: number | string | undefined
		vertOriginY?: number | string | undefined
		vHanging?: number | string | undefined
		vIdeographic?: number | string | undefined
		viewBox?: string | undefined
		viewTarget?: number | string | undefined
		visibility?: number | string | undefined
		vMathematical?: number | string | undefined
		widths?: number | string | undefined
		wordSpacing?: number | string | undefined
		writingMode?: number | string | undefined
		x1?: number | string | undefined
		x2?: number | string | undefined
		x?: number | string | undefined
		xChannelSelector?: string | undefined
		xHeight?: number | string | undefined
		xlinkActuate?: string | undefined
		xlinkArcrole?: string | undefined
		xlinkHref?: string | undefined
		xlinkRole?: string | undefined
		xlinkShow?: string | undefined
		xlinkTitle?: string | undefined
		xlinkType?: string | undefined
		xmlBase?: string | undefined
		xmlLang?: string | undefined
		xmlns?: string | undefined
		xmlnsXlink?: string | undefined
		xmlSpace?: string | undefined
		y1?: number | string | undefined
		y2?: number | string | undefined
		y?: number | string | undefined
		yChannelSelector?: string | undefined
		z?: number | string | undefined
		zoomAndPan?: string | undefined
	}

	//#endregion

	interface HTMLWebViewElement extends HTMLElement {}

	interface IntrinsicElements {
		// HTML
		a: {
			[P in keyof AnchorHTMLAttributes<HTMLAnchorElement>]:
				| AnchorHTMLAttributes<HTMLAnchorElement>[P]
				| Property<AnchorHTMLAttributes<HTMLAnchorElement>[P]>
		}
		abbr: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		address: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		area: {
			[P in keyof AreaHTMLAttributes<HTMLAreaElement>]:
				| AreaHTMLAttributes<HTMLAreaElement>[P]
				| Property<AreaHTMLAttributes<HTMLAreaElement>[P]>
		}
		article: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		aside: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		audio: {
			[P in keyof AudioHTMLAttributes<HTMLAudioElement>]:
				| AudioHTMLAttributes<HTMLAudioElement>[P]
				| Property<AudioHTMLAttributes<HTMLAudioElement>[P]>
		}
		b: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		base: {
			[P in keyof BaseHTMLAttributes<HTMLBaseElement>]:
				| BaseHTMLAttributes<HTMLBaseElement>[P]
				| Property<BaseHTMLAttributes<HTMLBaseElement>[P]>
		}
		bdi: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		bdo: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		big: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		blockquote: {
			[P in keyof BlockquoteHTMLAttributes<HTMLElement>]:
				| BlockquoteHTMLAttributes<HTMLElement>[P]
				| Property<BlockquoteHTMLAttributes<HTMLElement>[P]>
		}
		body: {
			[P in keyof HTMLAttributes<HTMLBodyElement>]:
				| HTMLAttributes<HTMLBodyElement>[P]
				| Property<HTMLAttributes<HTMLBodyElement>[P]>
		}
		br: {
			[P in keyof HTMLAttributes<HTMLBRElement>]:
				| HTMLAttributes<HTMLBRElement>[P]
				| Property<HTMLAttributes<HTMLBRElement>[P]>
		}
		button: {
			[P in keyof ButtonHTMLAttributes<HTMLButtonElement>]:
				| ButtonHTMLAttributes<HTMLButtonElement>[P]
				| Property<ButtonHTMLAttributes<HTMLButtonElement>[P]>
		}
		canvas: {
			[P in keyof CanvasHTMLAttributes<HTMLCanvasElement>]:
				| CanvasHTMLAttributes<HTMLCanvasElement>[P]
				| Property<CanvasHTMLAttributes<HTMLCanvasElement>[P]>
		}
		caption: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		cite: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		code: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		col: {
			[P in keyof ColHTMLAttributes<HTMLTableColElement>]:
				| ColHTMLAttributes<HTMLTableColElement>[P]
				| Property<ColHTMLAttributes<HTMLTableColElement>[P]>
		}
		colgroup: {
			[P in keyof ColgroupHTMLAttributes<HTMLTableColElement>]:
				| ColgroupHTMLAttributes<HTMLTableColElement>[P]
				| Property<ColgroupHTMLAttributes<HTMLTableColElement>[P]>
		}
		data: {
			[P in keyof DataHTMLAttributes<HTMLDataElement>]:
				| DataHTMLAttributes<HTMLDataElement>[P]
				| Property<DataHTMLAttributes<HTMLDataElement>[P]>
		}
		datalist: {
			[P in keyof HTMLAttributes<HTMLDataListElement>]:
				| HTMLAttributes<HTMLDataListElement>[P]
				| Property<HTMLAttributes<HTMLDataListElement>[P]>
		}
		dd: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		del: {
			[P in keyof DelHTMLAttributes<HTMLElement>]:
				| DelHTMLAttributes<HTMLElement>[P]
				| Property<DelHTMLAttributes<HTMLElement>[P]>
		}
		details: {
			[P in keyof DetailsHTMLAttributes<HTMLElement>]:
				| DetailsHTMLAttributes<HTMLElement>[P]
				| Property<DetailsHTMLAttributes<HTMLElement>[P]>
		}
		dfn: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		dialog: {
			[P in keyof DialogHTMLAttributes<HTMLDialogElement>]:
				| DialogHTMLAttributes<HTMLDialogElement>[P]
				| Property<DialogHTMLAttributes<HTMLDialogElement>[P]>
		}
		div: {
			[P in keyof HTMLAttributes<HTMLDivElement>]:
				| HTMLAttributes<HTMLDivElement>[P]
				| Property<HTMLAttributes<HTMLDivElement>[P]>
		}
		dl: {
			[P in keyof HTMLAttributes<HTMLDListElement>]:
				| HTMLAttributes<HTMLDListElement>[P]
				| Property<HTMLAttributes<HTMLDListElement>[P]>
		}
		dt: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		em: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		embed: {
			[P in keyof EmbedHTMLAttributes<HTMLEmbedElement>]:
				| EmbedHTMLAttributes<HTMLEmbedElement>[P]
				| Property<EmbedHTMLAttributes<HTMLEmbedElement>[P]>
		}
		fieldset: {
			[P in keyof FieldsetHTMLAttributes<HTMLFieldSetElement>]:
				| FieldsetHTMLAttributes<HTMLFieldSetElement>[P]
				| Property<FieldsetHTMLAttributes<HTMLFieldSetElement>[P]>
		}
		figcaption: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		figure: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		footer: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		form: {
			[P in keyof FormHTMLAttributes<HTMLFormElement>]:
				| FormHTMLAttributes<HTMLFormElement>[P]
				| Property<FormHTMLAttributes<HTMLFormElement>[P]>
		}
		h1: {
			[P in keyof HTMLAttributes<HTMLHeadingElement>]:
				| HTMLAttributes<HTMLHeadingElement>[P]
				| Property<HTMLAttributes<HTMLHeadingElement>[P]>
		}
		h2: {
			[P in keyof HTMLAttributes<HTMLHeadingElement>]:
				| HTMLAttributes<HTMLHeadingElement>[P]
				| Property<HTMLAttributes<HTMLHeadingElement>[P]>
		}
		h3: {
			[P in keyof HTMLAttributes<HTMLHeadingElement>]:
				| HTMLAttributes<HTMLHeadingElement>[P]
				| Property<HTMLAttributes<HTMLHeadingElement>[P]>
		}
		h4: {
			[P in keyof HTMLAttributes<HTMLHeadingElement>]:
				| HTMLAttributes<HTMLHeadingElement>[P]
				| Property<HTMLAttributes<HTMLHeadingElement>[P]>
		}
		h5: {
			[P in keyof HTMLAttributes<HTMLHeadingElement>]:
				| HTMLAttributes<HTMLHeadingElement>[P]
				| Property<HTMLAttributes<HTMLHeadingElement>[P]>
		}
		h6: {
			[P in keyof HTMLAttributes<HTMLHeadingElement>]:
				| HTMLAttributes<HTMLHeadingElement>[P]
				| Property<HTMLAttributes<HTMLHeadingElement>[P]>
		}
		head: {
			[P in keyof HTMLAttributes<HTMLHeadElement>]:
				| HTMLAttributes<HTMLHeadElement>[P]
				| Property<HTMLAttributes<HTMLHeadElement>[P]>
		}
		header: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		hgroup: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		hr: {
			[P in keyof HTMLAttributes<HTMLHRElement>]:
				| HTMLAttributes<HTMLHRElement>[P]
				| Property<HTMLAttributes<HTMLHRElement>[P]>
		}
		html: {
			[P in keyof HtmlHTMLAttributes<HTMLHtmlElement>]:
				| HtmlHTMLAttributes<HTMLHtmlElement>[P]
				| Property<HtmlHTMLAttributes<HTMLHtmlElement>[P]>
		}
		i: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		iframe: {
			[P in keyof IframeHTMLAttributes<HTMLIFrameElement>]:
				| IframeHTMLAttributes<HTMLIFrameElement>[P]
				| Property<IframeHTMLAttributes<HTMLIFrameElement>[P]>
		}
		img: {
			[P in keyof ImgHTMLAttributes<HTMLImageElement>]:
				| ImgHTMLAttributes<HTMLImageElement>[P]
				| Property<ImgHTMLAttributes<HTMLImageElement>[P]>
		}
		input: {
			[P in keyof InputHTMLAttributes<HTMLInputElement>]:
				| InputHTMLAttributes<HTMLInputElement>[P]
				| Property<InputHTMLAttributes<HTMLInputElement>[P]>
		}
		ins: {
			[P in keyof InsHTMLAttributes<HTMLModElement>]:
				| InsHTMLAttributes<HTMLModElement>[P]
				| Property<InsHTMLAttributes<HTMLModElement>[P]>
		}
		kbd: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		keygen: {
			[P in keyof KeygenHTMLAttributes<HTMLElement>]:
				| KeygenHTMLAttributes<HTMLElement>[P]
				| Property<KeygenHTMLAttributes<HTMLElement>[P]>
		}
		label: {
			[P in keyof LabelHTMLAttributes<HTMLLabelElement>]:
				| LabelHTMLAttributes<HTMLLabelElement>[P]
				| Property<LabelHTMLAttributes<HTMLLabelElement>[P]>
		}
		legend: {
			[P in keyof HTMLAttributes<HTMLLegendElement>]:
				| HTMLAttributes<HTMLLegendElement>[P]
				| Property<HTMLAttributes<HTMLLegendElement>[P]>
		}
		li: {
			[P in keyof LiHTMLAttributes<HTMLLIElement>]:
				| LiHTMLAttributes<HTMLLIElement>[P]
				| Property<LiHTMLAttributes<HTMLLIElement>[P]>
		}
		link: {
			[P in keyof LinkHTMLAttributes<HTMLLinkElement>]:
				| LinkHTMLAttributes<HTMLLinkElement>[P]
				| Property<LinkHTMLAttributes<HTMLLinkElement>[P]>
		}
		main: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		map: {
			[P in keyof MapHTMLAttributes<HTMLMapElement>]:
				| MapHTMLAttributes<HTMLMapElement>[P]
				| Property<MapHTMLAttributes<HTMLMapElement>[P]>
		}
		mark: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		menu: {
			[P in keyof MenuHTMLAttributes<HTMLElement>]:
				| MenuHTMLAttributes<HTMLElement>[P]
				| Property<MenuHTMLAttributes<HTMLElement>[P]>
		}
		menuitem: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		meta: {
			[P in keyof MetaHTMLAttributes<HTMLMetaElement>]:
				| MetaHTMLAttributes<HTMLMetaElement>[P]
				| Property<MetaHTMLAttributes<HTMLMetaElement>[P]>
		}
		meter: {
			[P in keyof MeterHTMLAttributes<HTMLElement>]:
				| MeterHTMLAttributes<HTMLElement>[P]
				| Property<MeterHTMLAttributes<HTMLElement>[P]>
		}
		nav: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		noindex: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		noscript: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		object: {
			[P in keyof ObjectHTMLAttributes<HTMLObjectElement>]:
				| ObjectHTMLAttributes<HTMLObjectElement>[P]
				| Property<ObjectHTMLAttributes<HTMLObjectElement>[P]>
		}
		ol: {
			[P in keyof OlHTMLAttributes<HTMLOListElement>]:
				| OlHTMLAttributes<HTMLOListElement>[P]
				| Property<OlHTMLAttributes<HTMLOListElement>[P]>
		}
		optgroup: {
			[P in keyof OptgroupHTMLAttributes<HTMLOptGroupElement>]:
				| OptgroupHTMLAttributes<HTMLOptGroupElement>[P]
				| Property<OptgroupHTMLAttributes<HTMLOptGroupElement>[P]>
		}
		option: {
			[P in keyof OptionHTMLAttributes<HTMLOptionElement>]:
				| OptionHTMLAttributes<HTMLOptionElement>[P]
				| Property<OptionHTMLAttributes<HTMLOptionElement>[P]>
		}
		output: {
			[P in keyof OutputHTMLAttributes<HTMLElement>]:
				| OutputHTMLAttributes<HTMLElement>[P]
				| Property<OutputHTMLAttributes<HTMLElement>[P]>
		}
		p: {
			[P in keyof HTMLAttributes<HTMLParagraphElement>]:
				| HTMLAttributes<HTMLParagraphElement>[P]
				| Property<HTMLAttributes<HTMLParagraphElement>[P]>
		}
		param: {
			[P in keyof ParamHTMLAttributes<HTMLParamElement>]:
				| ParamHTMLAttributes<HTMLParamElement>[P]
				| Property<ParamHTMLAttributes<HTMLParamElement>[P]>
		}
		picture: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		pre: {
			[P in keyof HTMLAttributes<HTMLPreElement>]:
				| HTMLAttributes<HTMLPreElement>[P]
				| Property<HTMLAttributes<HTMLPreElement>[P]>
		}
		progress: {
			[P in keyof ProgressHTMLAttributes<HTMLProgressElement>]:
				| ProgressHTMLAttributes<HTMLProgressElement>[P]
				| Property<ProgressHTMLAttributes<HTMLProgressElement>[P]>
		}
		q: {
			[P in keyof QuoteHTMLAttributes<HTMLQuoteElement>]:
				| QuoteHTMLAttributes<HTMLQuoteElement>[P]
				| Property<QuoteHTMLAttributes<HTMLQuoteElement>[P]>
		}
		rp: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		rt: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		ruby: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		s: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		samp: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		slot: {
			[P in keyof SlotHTMLAttributes<HTMLSlotElement>]:
				| SlotHTMLAttributes<HTMLSlotElement>[P]
				| Property<SlotHTMLAttributes<HTMLSlotElement>[P]>
		}
		script: {
			[P in keyof ScriptHTMLAttributes<HTMLScriptElement>]:
				| ScriptHTMLAttributes<HTMLScriptElement>[P]
				| Property<ScriptHTMLAttributes<HTMLScriptElement>[P]>
		}
		section: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		select: {
			[P in keyof SelectHTMLAttributes<HTMLSelectElement>]:
				| SelectHTMLAttributes<HTMLSelectElement>[P]
				| Property<SelectHTMLAttributes<HTMLSelectElement>[P]>
		}
		small: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		source: {
			[P in keyof SourceHTMLAttributes<HTMLSourceElement>]:
				| SourceHTMLAttributes<HTMLSourceElement>[P]
				| Property<SourceHTMLAttributes<HTMLSourceElement>[P]>
		}
		span: {
			[P in keyof HTMLAttributes<HTMLSpanElement>]:
				| HTMLAttributes<HTMLSpanElement>[P]
				| Property<HTMLAttributes<HTMLSpanElement>[P]>
		}
		strong: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		style: {
			[P in keyof StyleHTMLAttributes<HTMLStyleElement>]:
				| StyleHTMLAttributes<HTMLStyleElement>[P]
				| Property<StyleHTMLAttributes<HTMLStyleElement>[P]>
		}
		sub: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		summary: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		sup: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		table: {
			[P in keyof TableHTMLAttributes<HTMLTableElement>]:
				| TableHTMLAttributes<HTMLTableElement>[P]
				| Property<TableHTMLAttributes<HTMLTableElement>[P]>
		}
		template: {
			[P in keyof HTMLAttributes<HTMLTemplateElement>]:
				| HTMLAttributes<HTMLTemplateElement>[P]
				| Property<HTMLAttributes<HTMLTemplateElement>[P]>
		}
		tbody: {
			[P in keyof HTMLAttributes<HTMLTableSectionElement>]:
				| HTMLAttributes<HTMLTableSectionElement>[P]
				| Property<HTMLAttributes<HTMLTableSectionElement>[P]>
		}
		td: {
			[P in keyof TdHTMLAttributes<HTMLTableDataCellElement>]:
				| TdHTMLAttributes<HTMLTableDataCellElement>[P]
				| Property<TdHTMLAttributes<HTMLTableDataCellElement>[P]>
		}
		textarea: {
			[P in keyof TextareaHTMLAttributes<HTMLTextAreaElement>]:
				| TextareaHTMLAttributes<HTMLTextAreaElement>[P]
				| Property<TextareaHTMLAttributes<HTMLTextAreaElement>[P]>
		}
		tfoot: {
			[P in keyof HTMLAttributes<HTMLTableSectionElement>]:
				| HTMLAttributes<HTMLTableSectionElement>[P]
				| Property<HTMLAttributes<HTMLTableSectionElement>[P]>
		}
		th: {
			[P in keyof ThHTMLAttributes<HTMLTableHeaderCellElement>]:
				| ThHTMLAttributes<HTMLTableHeaderCellElement>[P]
				| Property<ThHTMLAttributes<HTMLTableHeaderCellElement>[P]>
		}
		thead: {
			[P in keyof HTMLAttributes<HTMLTableSectionElement>]:
				| HTMLAttributes<HTMLTableSectionElement>[P]
				| Property<HTMLAttributes<HTMLTableSectionElement>[P]>
		}
		time: {
			[P in keyof TimeHTMLAttributes<HTMLElement>]:
				| TimeHTMLAttributes<HTMLElement>[P]
				| Property<TimeHTMLAttributes<HTMLElement>[P]>
		}
		title: {
			[P in keyof HTMLAttributes<HTMLTitleElement>]:
				| HTMLAttributes<HTMLTitleElement>[P]
				| Property<HTMLAttributes<HTMLTitleElement>[P]>
		}
		tr: {
			[P in keyof HTMLAttributes<HTMLTableRowElement>]:
				| HTMLAttributes<HTMLTableRowElement>[P]
				| Property<HTMLAttributes<HTMLTableRowElement>[P]>
		}
		track: {
			[P in keyof TrackHTMLAttributes<HTMLTrackElement>]:
				| TrackHTMLAttributes<HTMLTrackElement>[P]
				| Property<TrackHTMLAttributes<HTMLTrackElement>[P]>
		}
		u: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		ul: {
			[P in keyof HTMLAttributes<HTMLUListElement>]:
				| HTMLAttributes<HTMLUListElement>[P]
				| Property<HTMLAttributes<HTMLUListElement>[P]>
		}
		var: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		video: {
			[P in keyof VideoHTMLAttributes<HTMLVideoElement>]:
				| VideoHTMLAttributes<HTMLVideoElement>[P]
				| Property<VideoHTMLAttributes<HTMLVideoElement>[P]>
		}
		wbr: {
			[P in keyof HTMLAttributes<HTMLElement>]:
				| HTMLAttributes<HTMLElement>[P]
				| Property<HTMLAttributes<HTMLElement>[P]>
		}
		webview: {
			[P in keyof WebViewHTMLAttributes<HTMLWebViewElement>]:
				| WebViewHTMLAttributes<HTMLWebViewElement>[P]
				| Property<WebViewHTMLAttributes<HTMLWebViewElement>[P]>
		}

		// SVG
		svg: {
			[P in keyof SVGAttributes<SVGSVGElement>]:
				| SVGAttributes<SVGSVGElement>[P]
				| Property<SVGAttributes<SVGSVGElement>[P]>
		}

		// TODO: It is SVGAnimateElement but is not in TypeScript's lib.dom.d.ts for now.
		animate: {
			[P in keyof SVGAttributes<SVGElement>]:
				| SVGAttributes<SVGElement>[P]
				| Property<SVGAttributes<SVGElement>[P]>
		}
		animateMotion: {
			[P in keyof SVGAttributes<SVGElement>]:
				| SVGAttributes<SVGElement>[P]
				| Property<SVGAttributes<SVGElement>[P]>
		}
		// TODO: It is SVGAnimateTransformElement but is not in TypeScript's lib.dom.d.ts for now.
		animateTransform: {
			[P in keyof SVGAttributes<SVGElement>]:
				| SVGAttributes<SVGElement>[P]
				| Property<SVGAttributes<SVGElement>[P]>
		}
		circle: {
			[P in keyof SVGAttributes<SVGCircleElement>]:
				| SVGAttributes<SVGCircleElement>[P]
				| Property<SVGAttributes<SVGCircleElement>[P]>
		}
		clipPath: {
			[P in keyof SVGAttributes<SVGClipPathElement>]:
				| SVGAttributes<SVGClipPathElement>[P]
				| Property<SVGAttributes<SVGClipPathElement>[P]>
		}
		defs: {
			[P in keyof SVGAttributes<SVGDefsElement>]:
				| SVGAttributes<SVGDefsElement>[P]
				| Property<SVGAttributes<SVGDefsElement>[P]>
		}
		desc: {
			[P in keyof SVGAttributes<SVGDescElement>]:
				| SVGAttributes<SVGDescElement>[P]
				| Property<SVGAttributes<SVGDescElement>[P]>
		}
		ellipse: {
			[P in keyof SVGAttributes<SVGEllipseElement>]:
				| SVGAttributes<SVGEllipseElement>[P]
				| Property<SVGAttributes<SVGEllipseElement>[P]>
		}
		feBlend: {
			[P in keyof SVGAttributes<SVGFEBlendElement>]:
				| SVGAttributes<SVGFEBlendElement>[P]
				| Property<SVGAttributes<SVGFEBlendElement>[P]>
		}
		feColorMatrix: {
			[P in keyof SVGAttributes<SVGFEColorMatrixElement>]:
				| SVGAttributes<SVGFEColorMatrixElement>[P]
				| Property<SVGAttributes<SVGFEColorMatrixElement>[P]>
		}
		feComponentTransfer: {
			[P in keyof SVGAttributes<SVGFEComponentTransferElement>]:
				| SVGAttributes<SVGFEComponentTransferElement>[P]
				| Property<SVGAttributes<SVGFEComponentTransferElement>[P]>
		}
		feComposite: {
			[P in keyof SVGAttributes<SVGFECompositeElement>]:
				| SVGAttributes<SVGFECompositeElement>[P]
				| Property<SVGAttributes<SVGFECompositeElement>[P]>
		}
		feConvolveMatrix: {
			[P in keyof SVGAttributes<SVGFEConvolveMatrixElement>]:
				| SVGAttributes<SVGFEConvolveMatrixElement>[P]
				| Property<SVGAttributes<SVGFEConvolveMatrixElement>[P]>
		}
		feDiffuseLighting: {
			[P in keyof SVGAttributes<SVGFEDiffuseLightingElement>]:
				| SVGAttributes<SVGFEDiffuseLightingElement>[P]
				| Property<SVGAttributes<SVGFEDiffuseLightingElement>[P]>
		}
		feDisplacementMap: {
			[P in keyof SVGAttributes<SVGFEDisplacementMapElement>]:
				| SVGAttributes<SVGFEDisplacementMapElement>[P]
				| Property<SVGAttributes<SVGFEDisplacementMapElement>[P]>
		}
		feDistantLight: {
			[P in keyof SVGAttributes<SVGFEDistantLightElement>]:
				| SVGAttributes<SVGFEDistantLightElement>[P]
				| Property<SVGAttributes<SVGFEDistantLightElement>[P]>
		}
		feDropShadow: {
			[P in keyof SVGAttributes<SVGFEDropShadowElement>]:
				| SVGAttributes<SVGFEDropShadowElement>[P]
				| Property<SVGAttributes<SVGFEDropShadowElement>[P]>
		}
		feFlood: {
			[P in keyof SVGAttributes<SVGFEFloodElement>]:
				| SVGAttributes<SVGFEFloodElement>[P]
				| Property<SVGAttributes<SVGFEFloodElement>[P]>
		}
		feFuncA: {
			[P in keyof SVGAttributes<SVGFEFuncAElement>]:
				| SVGAttributes<SVGFEFuncAElement>[P]
				| Property<SVGAttributes<SVGFEFuncAElement>[P]>
		}
		feFuncB: {
			[P in keyof SVGAttributes<SVGFEFuncBElement>]:
				| SVGAttributes<SVGFEFuncBElement>[P]
				| Property<SVGAttributes<SVGFEFuncBElement>[P]>
		}
		feFuncG: {
			[P in keyof SVGAttributes<SVGFEFuncGElement>]:
				| SVGAttributes<SVGFEFuncGElement>[P]
				| Property<SVGAttributes<SVGFEFuncGElement>[P]>
		}
		feFuncR: {
			[P in keyof SVGAttributes<SVGFEFuncRElement>]:
				| SVGAttributes<SVGFEFuncRElement>[P]
				| Property<SVGAttributes<SVGFEFuncRElement>[P]>
		}
		feGaussianBlur: {
			[P in keyof SVGAttributes<SVGFEGaussianBlurElement>]:
				| SVGAttributes<SVGFEGaussianBlurElement>[P]
				| Property<SVGAttributes<SVGFEGaussianBlurElement>[P]>
		}
		feImage: {
			[P in keyof SVGAttributes<SVGFEImageElement>]:
				| SVGAttributes<SVGFEImageElement>[P]
				| Property<SVGAttributes<SVGFEImageElement>[P]>
		}
		feMerge: {
			[P in keyof SVGAttributes<SVGFEMergeElement>]:
				| SVGAttributes<SVGFEMergeElement>[P]
				| Property<SVGAttributes<SVGFEMergeElement>[P]>
		}
		feMergeNode: {
			[P in keyof SVGAttributes<SVGFEMergeNodeElement>]:
				| SVGAttributes<SVGFEMergeNodeElement>[P]
				| Property<SVGAttributes<SVGFEMergeNodeElement>[P]>
		}
		feMorphology: {
			[P in keyof SVGAttributes<SVGFEMorphologyElement>]:
				| SVGAttributes<SVGFEMorphologyElement>[P]
				| Property<SVGAttributes<SVGFEMorphologyElement>[P]>
		}
		feOffset: {
			[P in keyof SVGAttributes<SVGFEOffsetElement>]:
				| SVGAttributes<SVGFEOffsetElement>[P]
				| Property<SVGAttributes<SVGFEOffsetElement>[P]>
		}
		fePointLight: {
			[P in keyof SVGAttributes<SVGFEPointLightElement>]:
				| SVGAttributes<SVGFEPointLightElement>[P]
				| Property<SVGAttributes<SVGFEPointLightElement>[P]>
		}
		feSpecularLighting: {
			[P in keyof SVGAttributes<SVGFESpecularLightingElement>]:
				| SVGAttributes<SVGFESpecularLightingElement>[P]
				| Property<SVGAttributes<SVGFESpecularLightingElement>[P]>
		}
		feSpotLight: {
			[P in keyof SVGAttributes<SVGFESpotLightElement>]:
				| SVGAttributes<SVGFESpotLightElement>[P]
				| Property<SVGAttributes<SVGFESpotLightElement>[P]>
		}
		feTile: {
			[P in keyof SVGAttributes<SVGFETileElement>]:
				| SVGAttributes<SVGFETileElement>[P]
				| Property<SVGAttributes<SVGFETileElement>[P]>
		}
		feTurbulence: {
			[P in keyof SVGAttributes<SVGFETurbulenceElement>]:
				| SVGAttributes<SVGFETurbulenceElement>[P]
				| Property<SVGAttributes<SVGFETurbulenceElement>[P]>
		}
		filter: {
			[P in keyof SVGAttributes<SVGFilterElement>]:
				| SVGAttributes<SVGFilterElement>[P]
				| Property<SVGAttributes<SVGFilterElement>[P]>
		}
		foreignObject: {
			[P in keyof SVGAttributes<SVGForeignObjectElement>]:
				| SVGAttributes<SVGForeignObjectElement>[P]
				| Property<SVGAttributes<SVGForeignObjectElement>[P]>
		}
		g: {
			[P in keyof SVGAttributes<SVGGElement>]:
				| SVGAttributes<SVGGElement>[P]
				| Property<SVGAttributes<SVGGElement>[P]>
		}
		image: {
			[P in keyof SVGAttributes<SVGImageElement>]:
				| SVGAttributes<SVGImageElement>[P]
				| Property<SVGAttributes<SVGImageElement>[P]>
		}
		line: {
			[P in keyof SVGAttributes<SVGLineElement>]:
				| SVGAttributes<SVGLineElement>[P]
				| Property<SVGAttributes<SVGLineElement>[P]>
		}
		linearGradient: {
			[P in keyof SVGAttributes<SVGLinearGradientElement>]:
				| SVGAttributes<SVGLinearGradientElement>[P]
				| Property<SVGAttributes<SVGLinearGradientElement>[P]>
		}
		marker: {
			[P in keyof SVGAttributes<SVGMarkerElement>]:
				| SVGAttributes<SVGMarkerElement>[P]
				| Property<SVGAttributes<SVGMarkerElement>[P]>
		}
		mask: {
			[P in keyof SVGAttributes<SVGMaskElement>]:
				| SVGAttributes<SVGMaskElement>[P]
				| Property<SVGAttributes<SVGMaskElement>[P]>
		}
		metadata: {
			[P in keyof SVGAttributes<SVGMetadataElement>]:
				| SVGAttributes<SVGMetadataElement>[P]
				| Property<SVGAttributes<SVGMetadataElement>[P]>
		}
		mpath: {
			[P in keyof SVGAttributes<SVGElement>]:
				| SVGAttributes<SVGElement>[P]
				| Property<SVGAttributes<SVGElement>[P]>
		}
		path: {
			[P in keyof SVGAttributes<SVGPathElement>]:
				| SVGAttributes<SVGPathElement>[P]
				| Property<SVGAttributes<SVGPathElement>[P]>
		}
		pattern: {
			[P in keyof SVGAttributes<SVGPatternElement>]:
				| SVGAttributes<SVGPatternElement>[P]
				| Property<SVGAttributes<SVGPatternElement>[P]>
		}
		polygon: {
			[P in keyof SVGAttributes<SVGPolygonElement>]:
				| SVGAttributes<SVGPolygonElement>[P]
				| Property<SVGAttributes<SVGPolygonElement>[P]>
		}
		polyline: {
			[P in keyof SVGAttributes<SVGPolylineElement>]:
				| SVGAttributes<SVGPolylineElement>[P]
				| Property<SVGAttributes<SVGPolylineElement>[P]>
		}
		radialGradient: {
			[P in keyof SVGAttributes<SVGRadialGradientElement>]:
				| SVGAttributes<SVGRadialGradientElement>[P]
				| Property<SVGAttributes<SVGRadialGradientElement>[P]>
		}
		rect: {
			[P in keyof SVGAttributes<SVGRectElement>]:
				| SVGAttributes<SVGRectElement>[P]
				| Property<SVGAttributes<SVGRectElement>[P]>
		}
		stop: {
			[P in keyof SVGAttributes<SVGStopElement>]:
				| SVGAttributes<SVGStopElement>[P]
				| Property<SVGAttributes<SVGStopElement>[P]>
		}
		switch: {
			[P in keyof SVGAttributes<SVGSwitchElement>]:
				| SVGAttributes<SVGSwitchElement>[P]
				| Property<SVGAttributes<SVGSwitchElement>[P]>
		}
		symbol: {
			[P in keyof SVGAttributes<SVGSymbolElement>]:
				| SVGAttributes<SVGSymbolElement>[P]
				| Property<SVGAttributes<SVGSymbolElement>[P]>
		}
		text: {
			[P in keyof SVGAttributes<SVGTextElement>]:
				| SVGAttributes<SVGTextElement>[P]
				| Property<SVGAttributes<SVGTextElement>[P]>
		}
		textPath: {
			[P in keyof SVGAttributes<SVGTextPathElement>]:
				| SVGAttributes<SVGTextPathElement>[P]
				| Property<SVGAttributes<SVGTextPathElement>[P]>
		}
		tspan: {
			[P in keyof SVGAttributes<SVGTSpanElement>]:
				| SVGAttributes<SVGTSpanElement>[P]
				| Property<SVGAttributes<SVGTSpanElement>[P]>
		}
		use: {
			[P in keyof SVGAttributes<SVGUseElement>]:
				| SVGAttributes<SVGUseElement>[P]
				| Property<SVGAttributes<SVGUseElement>[P]>
		}
		view: {
			[P in keyof SVGAttributes<SVGViewElement>]:
				| SVGAttributes<SVGViewElement>[P]
				| Property<SVGAttributes<SVGViewElement>[P]>
		}
	}
}
