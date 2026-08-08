package com.oakland.tutor

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.oakland.tutor.capture.ScreenCaptureService
import com.oakland.tutor.overlay.TutorOverlayService
import com.oakland.tutor.permissions.MediaProjectionPermissionManager
import com.oakland.tutor.permissions.OverlayPermissionManager
import com.oakland.tutor.tutor.InteractionRecord
import com.oakland.tutor.tutor.SessionSummaryData
import com.oakland.tutor.tutor.TutorSession
import com.oakland.tutor.ui.summary.SessionSummaryScreen

class MainActivity : ComponentActivity() {

    private lateinit var overlayPerm: OverlayPermissionManager
    private lateinit var projectionPerm: MediaProjectionPermissionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        overlayPerm = OverlayPermissionManager(this)
        projectionPerm = MediaProjectionPermissionManager(this)

        val projectionLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (result.resultCode == Activity.RESULT_OK && result.data != null) {
                ScreenCaptureService.start(this, result.resultCode, result.data!!)
            }
        }
        projectionPerm.attach(projectionLauncher)

        setContent {
            var showSummary by remember { mutableStateOf(false) }

            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    if (showSummary) {
                        val summary = TutorSession.getLastSummary() ?: sampleSummaryData()
                        SessionSummaryScreen(
                            summaryData = summary,
                            onClose = { showSummary = false },
                        )
                    } else {
                        SetupScreen(
                            onGrantOverlay = { overlayPerm.request() },
                            onGrantProjection = { projectionPerm.request() },
                            onStart = {
                                TutorOverlayService.start(this)
                            },
                            onStop = {
                                TutorOverlayService.stop(this)
                                ScreenCaptureService.stop(this)
                                showSummary = true
                            },
                            onDevShowCard = {
                                TutorOverlayService.devShowCard(this, 0.6f, 0.4f)
                            },
                            onViewSummary = {
                                showSummary = true
                            }
                        )
                    }
                }
            }
        }
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
    onGrantOverlay: () -> Unit,
    onGrantProjection: () -> Unit,
    onStart: () -> Unit,
    onStop: () -> Unit,
    onDevShowCard: () -> Unit,
    onViewSummary: () -> Unit,
) {
    var running by remember { mutableStateOf(false) }
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
            text = "Pen-First AI Math Tutor Cross-App Overlay",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = onGrantOverlay,
            modifier = Modifier.fillMaxWidth(0.8f),
        ) {
            Text(stringResource(R.string.grant_overlay))
        }

        Button(
            onClick = onGrantProjection,
            modifier = Modifier.fillMaxWidth(0.8f),
        ) {
            Text(stringResource(R.string.grant_projection))
        }

        if (!running) {
            Button(
                onClick = { onStart(); running = true },
                modifier = Modifier.fillMaxWidth(0.8f),
            ) {
                Text(stringResource(R.string.start_session))
            }
        } else {
            Button(
                onClick = { onStop(); running = false },
                modifier = Modifier.fillMaxWidth(0.8f),
            ) {
                Text(stringResource(R.string.stop_session))
            }
        }

        OutlinedButton(
            onClick = onViewSummary,
            modifier = Modifier.fillMaxWidth(0.8f),
        ) {
            Text("Teacher Session Summary")
        }

        OutlinedButton(
            onClick = onDevShowCard,
            modifier = Modifier.fillMaxWidth(0.8f),
        ) {
            Text(stringResource(R.string.dev_show_card))
        }
    }
}
