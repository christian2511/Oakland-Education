package com.oakland.tutor.ui.workspace

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Redo
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.unit.dp
import com.oakland.tutor.workspace.PenColors
import com.oakland.tutor.workspace.WorkspaceTool

/**
 * Goodnotes/Squid-style top toolbar. Rounded card, subtle shadow, icon
 * buttons with an active-state ring. Pen has a three-color quick picker.
 *
 * Tools laid out left→right: pen • colors • highlighter • eraser • undo •
 * redo • clear • Ask AI. See decision D-019.
 */
@Composable
fun WorkspaceToolbar(
    tool: WorkspaceTool,
    canUndo: Boolean,
    canRedo: Boolean,
    onSelectPen: (Color) -> Unit,
    onSelectHighlighter: () -> Unit,
    onSelectEraser: () -> Unit,
    onSelectAsk: () -> Unit,
    onUndo: () -> Unit,
    onRedo: () -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier
            .shadow(8.dp, RoundedCornerShape(24.dp))
            .clip(RoundedCornerShape(24.dp)),
        color = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface,
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            val currentPenColor = (tool as? WorkspaceTool.Pen)?.color
            val isHighlighter = tool is WorkspaceTool.Highlighter
            val isEraser = tool is WorkspaceTool.Eraser
            val isAsk = tool is WorkspaceTool.Ask

            ToolIcon(
                icon = Icons.Filled.EditNote,
                active = currentPenColor != null,
                onClick = { onSelectPen(currentPenColor ?: PenColors.Black) },
                contentDescription = "Pen",
            )
            PenColors.Quick.forEach { c ->
                ColorDot(
                    color = c,
                    active = currentPenColor == c,
                    onClick = { onSelectPen(c) },
                )
            }
            ToolbarDivider()
            ToolIcon(
                icon = Icons.Filled.Brush,
                active = isHighlighter,
                onClick = onSelectHighlighter,
                contentDescription = "Highlighter",
            )
            ToolIcon(
                icon = Icons.Filled.DeleteOutline,
                active = isEraser,
                onClick = onSelectEraser,
                contentDescription = "Eraser",
            )
            ToolbarDivider()
            ToolIcon(
                icon = Icons.Filled.Undo,
                active = false,
                enabled = canUndo,
                onClick = onUndo,
                contentDescription = "Undo",
            )
            ToolIcon(
                icon = Icons.Filled.Redo,
                active = false,
                enabled = canRedo,
                onClick = onRedo,
                contentDescription = "Redo",
            )
            ToolIcon(
                icon = Icons.Outlined.Delete,
                active = false,
                onClick = onClear,
                contentDescription = "Clear all",
            )
            ToolbarDivider()
            ToolIcon(
                icon = Icons.Filled.AutoAwesome,
                active = isAsk,
                onClick = onSelectAsk,
                contentDescription = "Ask AI",
                accent = true,
            )
        }
    }
}

@Composable
private fun ToolIcon(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    active: Boolean,
    onClick: () -> Unit,
    contentDescription: String,
    enabled: Boolean = true,
    accent: Boolean = false,
) {
    val ring = when {
        accent && active -> MaterialTheme.colorScheme.primary
        active -> MaterialTheme.colorScheme.primary
        else -> Color.Transparent
    }
    val bg = when {
        accent -> MaterialTheme.colorScheme.primaryContainer
        active -> MaterialTheme.colorScheme.secondaryContainer
        else -> Color.Transparent
    }
    val tint = when {
        !enabled -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.35f)
        accent -> MaterialTheme.colorScheme.onPrimaryContainer
        active -> MaterialTheme.colorScheme.onSecondaryContainer
        else -> MaterialTheme.colorScheme.onSurface
    }
    Box(
        modifier = Modifier
            .size(44.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(bg)
            .border(1.5.dp, ring, RoundedCornerShape(12.dp)),
        contentAlignment = Alignment.Center,
    ) {
        IconButton(onClick = onClick, enabled = enabled) {
            Icon(icon, contentDescription, tint = tint)
        }
    }
}

@Composable
private fun ColorDot(color: Color, active: Boolean, onClick: () -> Unit) {
    val ringColor = if (active) MaterialTheme.colorScheme.primary else Color.Transparent
    Box(
        modifier = Modifier
            .size(36.dp)
            .clip(CircleShape)
            .border(2.dp, ringColor, CircleShape)
            .pointerInput(color) { detectTapGestures { onClick() } },
        contentAlignment = Alignment.Center,
    ) {
        Box(
            modifier = Modifier
                .size(22.dp)
                .clip(CircleShape)
                .background(color)
                .border(1.dp, Color.Black.copy(alpha = 0.15f), CircleShape),
        )
    }
}

@Composable
private fun ToolbarDivider() {
    Spacer(Modifier.width(2.dp))
    Box(
        Modifier
            .width(1.dp)
            .height(24.dp)
            .background(MaterialTheme.colorScheme.outlineVariant),
    )
    Spacer(Modifier.width(2.dp))
}
