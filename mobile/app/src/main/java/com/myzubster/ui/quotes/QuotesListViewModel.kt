package com.myzubster.ui.quotes

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.myzubster.models.Quote
import com.myzubster.network.ApiClient
import kotlinx.coroutines.launch
import java.io.IOException

class QuotesListViewModel : ViewModel() {

    private val apiService = ApiClient.apiService
    
    private val _quotes = MutableLiveData<List<Quote>>()
    val quotes: LiveData<List<Quote>> = _quotes
    
    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> = _errorMessage
    
    private var currentFilter: String? = null
    private var allQuotes: List<Quote> = emptyList()

    fun loadQuotes() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.getQuotes()
                if (response.isSuccessful) {
                    allQuotes = response.body()?.data ?: emptyList()
                    applyFilter()
                } else {
                    _errorMessage.value = "Error loading quotes: ${response.message()}"
                }
            } catch (e: IOException) {
                _errorMessage.value = "Network error: ${e.message}"
            } catch (e: Exception) {
                _errorMessage.value = "Error: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun filterQuotes(status: String?) {
        currentFilter = status
        applyFilter()
    }

    private fun applyFilter() {
        val filtered = if (currentFilter == null) {
            allQuotes
        } else {
            allQuotes.filter { it.status?.lowercase() == currentFilter?.lowercase() }
        }
        _quotes.value = filtered
    }
}