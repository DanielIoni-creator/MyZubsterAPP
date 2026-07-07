package com.myzubster.ui.quotes

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.myzubster.models.CreateQuoteRequest
import com.myzubster.models.Skill
import com.myzubster.models.User
import com.myzubster.network.ApiClient
import kotlinx.coroutines.launch
import java.io.IOException

class CreateQuoteViewModel : ViewModel() {

    private val apiService = ApiClient.apiService

    private val _services = MutableLiveData<List<Skill>>()
    val services: LiveData<List<Skill>> = _services

    private val _providers = MutableLiveData<List<User>>()
    val providers: LiveData<List<User>> = _providers

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _quoteCreated = MutableLiveData(false)
    val quoteCreated: LiveData<Boolean> = _quoteCreated

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> = _errorMessage

    fun loadServices() {
        viewModelScope.launch {
            try {
                val response = apiService.getSkills()
                if (response.isSuccessful) {
                    _services.value = response.body()?.data ?: emptyList()
                } else {
                    _errorMessage.value = "Error loading services: ${response.message()}"
                }
            } catch (e: IOException) {
                _errorMessage.value = "Network error: ${e.message}"
            } catch (e: Exception) {
                _errorMessage.value = "Error: ${e.message}"
            }
        }
    }

    fun loadProviders() {
        viewModelScope.launch {
            try {
                val response = apiService.getUsers()
                if (response.isSuccessful) {
                    _providers.value = response.body()?.data ?: emptyList()
                } else {
                    _errorMessage.value = "Error loading providers: ${response.message()}"
                }
            } catch (e: IOException) {
                _errorMessage.value = "Network error: ${e.message}"
            } catch (e: Exception) {
                _errorMessage.value = "Error: ${e.message}"
            }
        }
    }

    fun createQuote(request: CreateQuoteRequest) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.createQuote(request)
                if (response.isSuccessful) {
                    _quoteCreated.value = true
                } else {
                    _errorMessage.value = "Failed to create quote: ${response.message()}"
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
}