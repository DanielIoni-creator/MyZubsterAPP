package com.myzubster.ui.quotes

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.tabs.TabLayout
import com.myzubster.R
import com.myzubster.adapters.QuotesAdapter
import com.myzubster.databinding.FragmentQuotesListBinding

class QuotesListFragment : Fragment() {

    private var _binding: FragmentQuotesListBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var viewModel: QuotesListViewModel
    private lateinit var adapter: QuotesAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentQuotesListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel = ViewModelProvider(this)[QuotesListViewModel::class.java]
        
        setupRecyclerView()
        setupTabs()
        setupFab()
        
        binding.btnCreateFirstQuote.setOnClickListener {
            navigateToCreateQuote()
        }
        
        observeData()
        viewModel.loadQuotes()
    }

    private fun setupRecyclerView() {
        adapter = QuotesAdapter { quote ->
            navigateToQuoteDetail(quote.id ?: "")
        }
        
        binding.recyclerViewQuotes.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = this@QuotesListFragment.adapter
            setHasFixedSize(true)
        }
    }

    private fun setupTabs() {
        binding.tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                val status = when (tab?.position) {
                    0 -> null
                    1 -> "pending"
                    2 -> "accepted"
                    3 -> "rejected"
                    else -> null
                }
                viewModel.filterQuotes(status)
            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })
    }

    private fun setupFab() {
        binding.fabCreateQuote.setOnClickListener {
            navigateToCreateQuote()
        }
    }

    private fun observeData() {
        viewModel.quotes.observe(viewLifecycleOwner) { quotes ->
            adapter.submitList(quotes)
            updateEmptyState(quotes.isNullOrEmpty())
            updateCount(quotes?.size ?: 0)
        }
        
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
        
        viewModel.errorMessage.observe(viewLifecycleOwner) { message ->
            message?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                viewModel.errorMessage.value = null
            }
        }
    }

    private fun updateEmptyState(isEmpty: Boolean) {
        if (isEmpty) {
            binding.emptyState.visibility = View.VISIBLE
            binding.recyclerViewQuotes.visibility = View.GONE
        } else {
            binding.emptyState.visibility = View.GONE
            binding.recyclerViewQuotes.visibility = View.VISIBLE
        }
    }

    private fun updateCount(count: Int) {
        binding.tvCount.text = count.toString()
    }

    private fun navigateToCreateQuote() {
        Toast.makeText(requireContext(), "Create Quote - Coming Soon", Toast.LENGTH_SHORT).show()
    }

    private fun navigateToQuoteDetail(quoteId: String) {
        Toast.makeText(requireContext(), "Quote Details - Coming Soon", Toast.LENGTH_SHORT).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}