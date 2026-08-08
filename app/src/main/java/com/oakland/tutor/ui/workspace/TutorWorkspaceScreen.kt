package com.oakland.tutor.ui.workspace

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.HistoryEdu
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.oakland.tutor.workspace.CoordinateMapper
import com.oakland.tutor.workspace.WorkspaceController
import com.oakland.tutor.workspace.WorkspaceTool

/**
 * Full workspace screen. Composition:
 *
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │  [<]                    Toolbar                     [summary] │  ← top bar
 *   │                                                               │
 *   │                       WorkCanvas                              │
 *   │                        (grid + persistent ink)                │
 *   │                                                               │
 *   │                       AnnotationLayer (only in Ask mode)      │
 *   │                                                               │
 *   │                       TutorHintCard (anchored to target)      │
 *   │                                                               │
 *   │                                            WorkspaceBubble ●  │
 *   └───────────────────────────────────────────────────────────────┘
 */
@Composable
fun TutorWorkspaceScreen(
    controller: WorkspaceController,
    onBack: () -> Unit,
    onOpenSummary: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val tool by controller.tool.collectAsState()
    val strokes by controller.workStrokes.collectAsState()
    val annotationVisible by controller.annotationVisible.collectAsState()
    val sessionState by controller.sessionState.collectAsState()
    val hint by controller.hint.collectAsState()

    var canvasSize by remember { mutableStateOf(IntSize.Zero) }
    var strokeInProgress by remember { mutableStateOf<MutableList<Offset>?>(null) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .windowInsetsPadding(WindowInsets.safeDrawing),
    ) {
        // Canvas layer (persistent ink)
        WorkCanvas(
            strokes = strokes,
            tool = tool,
            eraserRadiusDp = 18f,
            onStrokeStart = { strokeInProgress = mutableListOf() },
            onStrokePoint = { pt -> strokeInProgress?.add(pt) },
            onStrokeEnd = { committed ->
                strokeInProgress = null
                if (committed != null && committed.points.isNotEmpty()) {
                    controller.addStroke(committed)
                }
            },
            onErase = controller::eraseAt,
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 68.dp)
                .onSizeChanged { canvasSize = it },
        )

        // Annotation overlay (only interactive in Ask mode)
        if (annotationVisible) {
            AnnotationLayer(
                state = controller.annotationState,
                onStrokeComplete = {
                    controller.onAnnotationComplete(
                        CoordinateMapper.IntSize(canvasSize.width, canvasSize.height)
                    )
                },
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 68.dp),
            )
        }

        // Top bar + toolbar
        TopBar(
            toolbar = {
                WorkspaceToolbar(
                    tool = tool,
                    canUndo = strokes.isNotEmpty(),
                    canRedo = true,
                    onSelectPen = { c -> controller.selectTool(WorkspaceTool.Pen(c)) },
                    onSelectHighlighter = { controller.selectTool(WorkspaceTool.Highlighter()) },
                    onSelectEraser = { controller.selectTool(WorkspaceTool.Eraser) },
                    onSelectAsk = { controller.selectTool(WorkspaceTool.Ask) },
                    onUndo = controller::undo,
                    onRedo = controller::redo,
                    onClear = controller::clearWork,
                )
            },
            onBack = onBack,
            onOpenSummary = onOpenSummary,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
        )

        // Anchored hint card
        val currentHint = hint
        if (currentHint != null) {
            val density = LocalDensity.current
            val cardEstPx = with(density) { CoordinateMapper.IntSize(280.dp.roundToPx(), 140.dp.roundToPx()) }
            val target = CoordinateMapper.normalizedBboxToPixel(
                currentHint.response.bbox.x,
                currentHint.response.bbox.y,
                currentHint.response.bbox.width,
                currentHint.response.bbox.height,
                CoordinateMapper.IntSize(canvasSize.width, canvasSize.height),
            )
            val position = CoordinateMapper.placeCard(
                cardEstPx, target,
                CoordinateMapper.IntSize(canvasSize.width, canvasSize.height),
            )
            TutorHintCard(
                visible = true,
                response = currentHint.response,
                onDismiss = controller::dismissHint,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(top = 68.dp)
                    .offset { IntOffset(position.x, position.y) },
            )
        }

        // AI bubble (draggable, bottom-right by default)
        WorkspaceBubble(
            state = sessionState,
            parentSize = canvasSize,
            onTap = { controller.selectTool(WorkspaceTool.Ask) },
            modifier = Modifier.align(Alignment.TopStart).padding(top = 68.dp),
        )
    }
}

@Composable
private fun TopBar(
    toolbar: @Composable () -> Unit,
    onBack: () -> Unit,
    onOpenSummary: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
        }
        Spacer(Modifier.width(4.dp))
        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
            toolbar()
        }
        Spacer(Modifier.width(4.dp))
        IconButton(onClick = onOpenSummary) {
            Icon(Icons.Filled.HistoryEdu, contentDescription = "Session summary")
        }
    }
}
