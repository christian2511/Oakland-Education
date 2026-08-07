package com.oakland.tutor.overlay

import android.content.Context
import android.view.View
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner

/**
 * Bridges a ComposeView attached from a Service to the owners Compose expects.
 * See plan §14.
 */
class OverlayComposeHost(context: Context) :
    LifecycleOwner, ViewModelStoreOwner, SavedStateRegistryOwner {

    private val lifecycleRegistry = LifecycleRegistry(this)
    private val store = ViewModelStore()
    private val savedStateController = SavedStateRegistryController.create(this).apply {
        performRestore(null)
    }

    val view: ComposeView = ComposeView(context).apply {
        setViewTreeLifecycleOwner(this@OverlayComposeHost)
        setViewTreeViewModelStoreOwner(this@OverlayComposeHost)
        setViewTreeSavedStateRegistryOwner(this@OverlayComposeHost)
    }

    override val lifecycle: Lifecycle get() = lifecycleRegistry
    override val viewModelStore: ViewModelStore get() = store
    override val savedStateRegistry: SavedStateRegistry get() = savedStateController.savedStateRegistry

    fun setContent(content: @Composable () -> Unit) {
        view.setContent(content)
    }

    fun onAttached() {
        lifecycleRegistry.currentState = Lifecycle.State.RESUMED
    }

    fun onDetached() {
        lifecycleRegistry.currentState = Lifecycle.State.DESTROYED
        store.clear()
    }

    fun asView(): View = view
}
