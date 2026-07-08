package com.myzbuster.app.ui.base

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.myzbuster.app.utils.NetworkUtils

abstract class BaseActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    protected fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }

    protected fun isNetworkAvailable(): Boolean {
        return NetworkUtils.isNetworkAvailable(this)
    }

    protected fun checkNetworkAndShowError(): Boolean {
        if (!isNetworkAvailable()) {
            showToast("Nessuna connessione di rete")
            return false
        }
        return true
    }

    protected open fun showLoading() {}
    protected open fun hideLoading() {}
}