package com.myzubster.ui.quotes

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.myzubster.R
import com.myzubster.databinding.FragmentCreateQuoteBinding
import com.myzubster.models.CreateQuoteRequest
import com.myzubster.models.Skill
import com.myzubster.models.User
import com.myzubster.network.ApiClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class CreateQuoteFragment : Fragment() {

    private var _binding: FragmentCreateQuoteBinding? = null
    private val binding get() = _binding!!

    private lateinit var viewModel: CreateQuoteViewModel
    
    private var services: List<Skill> = emptyList()
    private var providers: List<User> = emptyList()
    
    private var selectedServiceId: String? = null
    private var selectedProviderId: String? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCreateQuoteBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this)[CreateQuoteViewModel::class.java]

        setupToolbar()
        setupSpinners()
        setupButtons()
        observeData()
        loadData()
    }

    private fun setupToolbar() {
        binding.toolbar.setNavigationOnClickListener {
            findNavController().navigateUp()
        }
    }

    private fun setupSpinners() {
        // Service Spinner
        binding.actvService.setOnItemClickListener { _, _, position, _ ->
            selectedServiceId = services[position].id
        }

        // Provider Spinner
        binding.actvProvider.setOnItemClickListener { _, _, position, _ ->
            selectedProviderId = providers[position].id
        }
    }

    private fun setupButtons() {
        binding.btnSubmit.setOnClickListener {
            createQuote()
        }

        binding.btnCancel.setOnClickListener {
            findNavController().navigateUp()
        }
    }

    private fun observeData() {
        viewModel.services.observe(viewLifecycleOwner) { serviceList ->
            services = serviceList
            val serviceNames = serviceList.map { it.title ?: it.name ?: "Unknown" }
            val adapter = ArrayAdapter(
                requireContext(),
                android.R.layout.simple_dropdown_item_1line,
                serviceNames
            )
            binding.actvService.setAdapter(adapter)
        }

        viewModel.providers.observe(viewLifecycleOwner) { providerList ->
            providers = providerList
            val providerNames = providerList.map { it.name ?: it.email ?: "Unknown" }
            val adapter = ArrayAdapter(
                requireContext(),
                android.R.layout.simple_dropdown_item_1line,
                providerNames
            )
            binding.actvProvider.setAdapter(adapter)
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            binding.formContainer.visibility = if (isLoading) View.GONE else View.VISIBLE
        }

        viewModel.quoteCreated.observe(viewLifecycleOwner) { success ->
            if (success) {
                Toast.makeText(requireContext(), "Quote created successfully!", Toast.LENGTH_SHORT).show()
                findNavController().navigateUp()
            }
        }

        viewModel.errorMessage.observe(viewLifecycleOwner) { message ->
            message?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                viewModel.errorMessage.value = null
            }
        }
    }

    private fun loadData() {
        viewModel.loadServices()
        viewModel.loadProviders()
    }

    private fun createQuote() {
        val amountText = binding.etAmount.text.toString()
        val duration = binding.etDuration.text.toString()
        val description = binding.etDescription.text.toString()

        // Validation
        if (selectedServiceId == null) {
            Toast.makeText(requireContext(), "Please select a service", Toast.LENGTH_SHORT).show()
            return
        }

        if (selectedProviderId == null) {
            Toast.makeText(requireContext(), "Please select a provider", Toast.LENGTH_SHORT).show()
            return
        }

        if (amountText.isEmpty()) {
            Toast.makeText(requireContext(), "Please enter an amount", Toast.LENGTH_SHORT).show()
            return
        }

        val amount = amountText.toDoubleOrNull()
        if (amount == null || amount <= 0) {
            Toast.makeText(requireContext(), "Please enter a valid amount", Toast.LENGTH_SHORT).show()
            return
        }

        val request = CreateQuoteRequest(
            serviceId = selectedServiceId!!,
            providerId = selectedProviderId!!,
            amount = amount,
            description = description,
            estimatedDuration = duration
        )

        viewModel.createQuote(request)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}