package com.myzubster.adapters

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.myzubster.R
import com.myzubster.databinding.ItemQuoteBinding
import com.myzubster.models.Quote
import java.text.SimpleDateFormat
import java.util.*

class QuotesAdapter(
    private val onItemClick: (Quote) -> Unit
) : RecyclerView.Adapter<QuotesAdapter.QuoteViewHolder>() {

    private var quotes: List<Quote> = emptyList()
    private val dateFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())

    fun submitList(newList: List<Quote>?) {
        quotes = newList ?: emptyList()
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): QuoteViewHolder {
        val binding = ItemQuoteBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return QuoteViewHolder(binding)
    }

    override fun onBindViewHolder(holder: QuoteViewHolder, position: Int) {
        val quote = quotes[position]
        holder.bind(quote)
    }

    override fun getItemCount(): Int = quotes.size

    inner class QuoteViewHolder(
        private val binding: ItemQuoteBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(quote: Quote) {
            binding.tvServiceName.text = quote.serviceName ?: "Service"
            binding.tvAmount.text = "$${String.format("%.2f", quote.amount)}"
            binding.tvDescription.text = quote.description ?: "No description"
            
            quote.createdAt?.let {
                try {
                    val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                        .parse(it)
                    binding.tvDate.text = "Created: ${dateFormat.format(date ?: Date())}"
                } catch (e: Exception) {
                    binding.tvDate.text = "Created: $it"
                }
            } ?: run {
                binding.tvDate.text = "Created: N/A"
            }
            
            val statusText = quote.status ?: "pending"
            binding.tvStatus.text = statusText.replaceFirstChar { 
                if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() 
            }
            
            val statusColor = when (statusText.lowercase()) {
                "pending" -> Color.parseColor("#FF9800")
                "accepted" -> Color.parseColor("#4CAF50")
                "approved" -> Color.parseColor("#4CAF50")
                "rejected" -> Color.parseColor("#F44336")
                "cancelled" -> Color.parseColor("#F44336")
                else -> Color.parseColor("#999999")
            }
            binding.tvStatus.setBackgroundColor(statusColor)
            
            quote.expiresAt?.let {
                try {
                    val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                        .parse(it)
                    binding.tvExpires.text = "Expires: ${dateFormat.format(date ?: Date())}"
                    binding.tvExpires.visibility = android.view.View.VISIBLE
                } catch (e: Exception) {
                    binding.tvExpires.text = "Expires: $it"
                    binding.tvExpires.visibility = android.view.View.VISIBLE
                }
            } ?: run {
                binding.tvExpires.visibility = android.view.View.GONE
            }

            binding.root.setOnClickListener {
                onItemClick(quote)
            }
        }
    }
}