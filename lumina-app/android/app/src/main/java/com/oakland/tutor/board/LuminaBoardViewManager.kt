package com.oakland.tutor.board

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class LuminaBoardViewManager : SimpleViewManager<LuminaBoardView>() {
    override fun getName(): String = "LuminaBoardView"

    override fun createViewInstance(reactContext: ThemedReactContext): LuminaBoardView =
        LuminaBoardView(reactContext)

    @ReactProp(name = "guides")
    fun setGuides(view: LuminaBoardView, value: Boolean) {
        view.guidesEnabled = value
    }

    @ReactProp(name = "tool")
    fun setTool(view: LuminaBoardView, tool: String?) {
        view.tool = when (tool) {
            "eraser" -> LuminaBoardView.Tool.ERASER
            "marker" -> LuminaBoardView.Tool.MARKER
            "highlighter" -> LuminaBoardView.Tool.HIGHLIGHTER
            else -> LuminaBoardView.Tool.PEN
        }
    }

    @ReactProp(name = "paper")
    fun setPaper(view: LuminaBoardView, paper: String?) {
        view.paper = when (paper) {
            "blank" -> LuminaBoardView.Paper.BLANK
            "grid" -> LuminaBoardView.Paper.GRID
            "dot" -> LuminaBoardView.Paper.DOT
            else -> LuminaBoardView.Paper.RULED
        }
    }

    @ReactProp(name = "penColor", customType = "Color")
    fun setPenColor(view: LuminaBoardView, color: Int?) {
        view.penColor = color ?: LuminaBoardView.INK_DEFAULT
    }

    @ReactProp(name = "penSize", defaultFloat = 3.2f)
    fun setPenSize(view: LuminaBoardView, size: Float) {
        if (size > 0f) view.penSize = size
    }

    @ReactProp(name = "eraserSize", defaultFloat = 32f)
    fun setEraserSize(view: LuminaBoardView, size: Float) {
        if (size > 0f) view.eraserRadius = size
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>()
            .put(
                "onStrokeEnd",
                MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", "onStrokeEnd", "captured", "onStrokeEndCapture"),
                ),
            )
            .put(
                "onStrokeCountChange",
                MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", "onStrokeCountChange", "captured", "onStrokeCountChangeCapture"),
                ),
            )
            .put(
                "onAnnotationChange",
                MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", "onAnnotationChange", "captured", "onAnnotationChangeCapture"),
                ),
            )
            .build()
    }

    override fun receiveCommand(root: LuminaBoardView, commandId: String?, args: ReadableArray?) {
        when (commandId) {
            "clear" -> root.clear()
            "undo" -> root.undo()
            "redo" -> root.redo()
            "clearAnnotation" -> root.clearAnnotation()
            "clearAi" -> root.clearAi()
            "injectAiInk" -> args?.getString(0)?.let(root::injectAiInk)
            "setMode" -> root.mode = when (args?.getString(0)) {
                "annotate" -> LuminaBoardView.Mode.ANNOTATE
                else -> LuminaBoardView.Mode.WRITE
            }
        }
    }
}
