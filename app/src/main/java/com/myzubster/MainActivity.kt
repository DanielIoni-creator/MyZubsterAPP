package com.myzubster

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tvTitle = findViewById<TextView>(R.id.tvTitle)
        val btnTest = findViewById<Button>(R.id.btnTest)

        tvTitle.text = "MyZubster"

        btnTest.setOnClickListener {
            Toast.makeText(this, "✅ MyZubster funziona!", Toast.LENGTH_SHORT).show()
        }
    }
}