package com.oakland.tutor

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.unit.dp
import com.oakland.tutor.capture.ScreenCaptureService
import com.oakland.tutor.overlay.TutorOverlayService
import com.oakland.tutor.permissions.MediaProjectionPermissionManager
import com.oakland.tutor.permissions.OverlayPermissionManager

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
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    SetupScreen(
                        onGrantOverlay = { overlayPerm.request() },
                        onGrantProjection = { projectionPerm.request() },
                        onStart = {
                            TutorOverlayService.start(this)
                        },
                        onStop = {
                            TutorOverlayService.stop(this)
                            ScreenCaptureService.stop(this)
                        },
                        onDevShowCard = {
                            TutorOverlayService.devShowCard(this, 0.6f, 0.4f)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun SetupScreen(
    onGrantOverlay: () -> Unit,
    onGrantProjection: () -> Unit,
    onStart: () -> Unit,
    onStop: () -> Unit,
    onDevShowCard: () -> Unit,
) {
    var running by remember { mutableStateOf(false) }
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = stringResource(R.string.setup_title),
            style = MaterialTheme.typography.headlineSmall,
        )
        Button(onClick = onGrantOverlay) { Text(stringResource(R.string.grant_overlay)) }
        Button(onClick = onGrantProjection) { Text(stringResource(R.string.grant_projection)) }
        if (!running) {
            Button(onClick = { onStart(); running = true }) {
                Text(stringResource(R.string.start_session))
            }
        } else {
            Button(onClick = { onStop(); running = false }) {
                Text(stringResource(R.string.stop_session))
            }
        }
        Button(onClick = onDevShowCard) { Text(stringResource(R.string.dev_show_card)) }
    }
}
