package com.oakland.tutor

import android.app.Activity
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.oakland.tutor.capture.ScreenCaptureService
import com.oakland.tutor.permissions.MediaProjectionPermissionManager
import com.oakland.tutor.tutor.InteractionRecord
import com.oakland.tutor.tutor.SessionSummaryData
import com.oakland.tutor.tutor.TutorSession
import com.oakland.tutor.ui.summary.SessionSummaryScreen
import com.oakland.tutor.ui.workspace.TutorWorkspaceScreen
import com.oakland.tutor.workspace.WorkspaceController

class MainActivity : ComponentActivity() {

    private lateinit var projectionPerm: MediaProjectionPermissionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        projectionPerm = MediaProjectionPermissionManager(this)
        var projectionGranted = false

        val projectionLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (result.resultCode == Activity.RESULT_OK && result.data != null) {
                ScreenCaptureService.start(this, result.resultCode, result.data!!)
                projectionGranted = true
            }
        }
        projectionPerm.attach(projectionLauncher)

        setContent {
            var route by remember { mutableStateOf<Route>(Route.Setup) }
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    when (val r = route) {
                        Route.Setup -> SetupScreen(
                            onGrantProjection = { projectionPerm.request() },
                            onOpenWorkspace = { route = Route.Workspace },
                            onOpenSummary = { route = Route.Summary },
                        )
                        Route.Workspace -> {
                            val scope = rememberCoroutineScope()
                            val ctx = LocalContext.current
                            val controller = remember { WorkspaceController(ctx, scope) }
                            TutorWorkspaceScreen(
                                controller = controller,
                                onBack = {
                                    TutorSession.setLastSummary(controller.summary)
                                    ScreenCaptureService.stop(this)
                                    route = Route.Setup
                                },
                                onOpenSummary = {
                                    TutorSession.setLastSummary(controller.summary)
                                    route = Route.Summary
                                },
                            )
                        }
                        Route.Summary -> SessionSummaryScreen(
                            summaryData = TutorSession.getLastSummary() ?: sampleSummaryData(),
                            onClose = { route = Route.Setup },
                        )
                    }
                }
            }
        }
    }

    private sealed interface Route {
        data object Setup : Route
        data object Workspace : Route
        data object Summary : Route
    }

    private fun sampleSummaryData() = SessionSummaryData(
        startTimeMs = System.currentTimeMillis() - 180000,
        endTimeMs = System.currentTimeMillis(),
        interactions = mutableListOf(
            InteractionRecord(
                targetDescription = "the +4 term in 3(x + 4) = 21",
                hint = "What else does the 3 multiply inside the parentheses?",
                pointX = 0.621f,
                pointY = 0.437f,
            ),
            InteractionRecord(
                targetDescription = "the denominators 2 and 3 in 1/2 + 1/3",
                hint = "Before adding fractions, what needs to be the same for both denominators?",
                pointX = 0.480f,
                pointY = 0.380f,
            )
        )
    )
}

@Composable
private fun SetupScreen(
    onGrantProjection: () -> Unit,
    onOpenWorkspace: () -> Unit,
    onOpenSummary: () -> Unit,
) {
    var projectionRequested by remember { mutableStateOf(false) }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = stringResource(R.string.setup_title),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = "Pen-first AI math tutor",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = { onGrantProjection(); projectionRequested = true },
            modifier = Modifier.fillMaxWidth(0.8f),
        ) {
            Text(stringResource(R.string.grant_projection))
        }

        Button(
            onClick = onOpenWorkspace,
            modifier = Modifier.fillMaxWidth(0.8f),
            enabled = projectionRequested,
        ) {
            Text("Open workspace")
        }

        OutlinedButton(
            onClick = onOpenSummary,
            modifier = Modifier.fillMaxWidth(0.8f),
        ) {
            Text("Teacher session summary")
        }
    }
}
