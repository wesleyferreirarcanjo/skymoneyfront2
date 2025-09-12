import { useState, useEffect } from 'react';
import { queueAPI, authAPI } from '../../lib/api';
import { Clock, Users, AlertCircle, Search, X, Eye, Calendar, User, Mail, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Trash2, Crown, Target } from 'lucide-react';
import { QueueEntry, CreateQueueEntryRequest } from '../../types/queue';
import { User as UserType } from '../../types/user';

// Maximum number of slots available in the queue
const MAX_QUEUE_SLOTS = 100;

export default function Queue() {
  const [queueEntries, setQueueEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [entriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [allQueueEntries, setAllQueueEntries] = useState<QueueEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allApprovedUsers, setAllApprovedUsers] = useState<UserType[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<QueueEntry | null>(null);
  const [userFilter, setUserFilter] = useState<'all' | 'in-queue' | 'waiting'>('all');
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [allocationResults, setAllocationResults] = useState<{
    successCount: number;
    totalAttempted: number;
    errorMessage?: string;
    successMessage?: string;
  } | null>(null);
  const [isBulkRemoveModalOpen, setIsBulkRemoveModalOpen] = useState(false);
  const [isBulkConfirmModalOpen, setIsBulkConfirmModalOpen] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [bulkRemoveLoading, setBulkRemoveLoading] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isSwapConfirmModalOpen, setIsSwapConfirmModalOpen] = useState(false);
  const [swapPositions, setSwapPositions] = useState<number[]>([]);
  const [swapLoading, setSwapLoading] = useState(false);

  useEffect(() => {
    fetchQueueEntries();
    fetchAllApprovedUsers();
  }, []);

  useEffect(() => {
    filterQueueEntries();
  }, [searchTerm, allQueueEntries, currentPage, userFilter]);

  const fetchQueueEntries = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching queue entries...');
      const entries = await queueAPI.getQueueEntries();
      console.log('✅ Queue entries fetched:', entries);
      setAllQueueEntries(entries || []);
    } catch (error) {
      console.error('❌ Error fetching queue entries:', error);
      setAllQueueEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApprovedUsers = async () => {
    try {
      console.log('🔄 Fetching all approved users...');
      const users = await authAPI.getUsers();
      console.log('✅ Users fetched:', users);
      // Filter only approved users (not admin and adminApproved)
      const approvedUsers = (users || []).filter(user => 
        user.role.toLowerCase() !== 'admin' && user.adminApproved
      );
      console.log('✅ Approved users:', approvedUsers);
      setAllApprovedUsers(approvedUsers);
    } catch (error) {
      console.error('❌ Error fetching approved users:', error);
      setAllApprovedUsers([]);
    }
  };

  const filterQueueEntries = () => {
    // Create combined list of all users (in queue and waiting)
    const usersInQueue = allQueueEntries
      .filter(entry => entry.user_id !== null && entry.user_id !== '')
      .map(entry => entry.user_id);
    const waitingUsers = allApprovedUsers.filter(user => !usersInQueue.includes(user.id));
    
    // Create display items for occupied queue entries (with valid user_id)
    const queueItems = allQueueEntries
      .filter(entry => {
        // Only include entries that have a valid user_id AND a valid user object
        const hasValidUserId = entry.user_id !== null && entry.user_id !== '';
        const hasUser = entry.user !== null && entry.user !== undefined;
        return hasValidUserId && hasUser;
      })
      .map(entry => ({
        type: 'queue' as const,
        id: entry.id,
        user: entry.user!,
        entry: entry,
        status: entry.is_receiver ? 'receiver' : 'active'
      }));
    
    
    // Create display items for waiting users
    const waitingItems = waitingUsers.map(user => ({
      type: 'waiting' as const,
      id: user.id,
      user: user,
      entry: null,
      status: 'waiting'
    }));
    
    // Combine all items (excluding empty slots from Todos view)
    let allItems = [...queueItems, ...waitingItems];
    
    // Apply user filter
    if (userFilter === 'in-queue') {
      // Show only occupied queue entries (users actually in the queue)
      allItems = queueItems;
    } else if (userFilter === 'waiting') {
      allItems = waitingItems;
    }
    // For 'all' filter, show queueItems + waitingItems (no empty slots)
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      allItems = allItems.filter(item => {
        return (
          item.user &&
          (item.user.firstName.toLowerCase().includes(searchLower) ||
           item.user.lastName.toLowerCase().includes(searchLower) ||
           item.user.email.toLowerCase().includes(searchLower) ||
           (item.entry && item.entry.donation_number.toString().includes(searchTerm)))
        );
      });
    }

    // Apply pagination to filtered results
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const paginatedItems = allItems.slice(startIndex, endIndex);

    setQueueEntries(paginatedItems);
    setTotalEntries(allItems.length);
    setTotalPages(Math.ceil(allItems.length / entriesPerPage));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewEntry = (entryId: string) => {
    const entry = allQueueEntries.find(e => e.id === entryId);
    if (entry) {
      setSelectedEntry(entry);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const handleAddToQueue = async () => {
    try {
      setAddLoading(true);
      
      // Get users not in queue, sorted by createdAt (oldest first - order of arrival)
      const usersInQueue = allQueueEntries
        .filter(entry => entry.user_id !== null && entry.user_id !== '')
        .map(entry => entry.user_id);
      
      const waitingUsers = allApprovedUsers
        .filter(user => !usersInQueue.includes(user.id))
        .sort((a, b) => {
          // Sort by createdAt date (oldest first - order of arrival)
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateA.getTime() - dateB.getTime();
        });
      
      if (waitingUsers.length === 0) {
        setAllocationResults({
          successCount: 0,
          totalAttempted: 0,
          errorMessage: 'Não há usuários aprovados aguardando para entrar na fila.'
        });
        setIsResultsModalOpen(true);
        return;
      }
      
      // Get available positions (free slots)
      const occupiedPositions = allQueueEntries
        .filter(entry => entry.user_id !== null && entry.user_id !== '')
        .map(entry => entry.position);
      
      const availablePositions = [];
      for (let i = 1; i <= MAX_QUEUE_SLOTS; i++) {
        if (!occupiedPositions.includes(i)) {
          availablePositions.push(i);
        }
      }
      
      if (availablePositions.length === 0) {
        setAllocationResults({
          successCount: 0,
          totalAttempted: 0,
          errorMessage: 'Não há vagas disponíveis na fila.'
        });
        setIsResultsModalOpen(true);
        return;
      }
      
      // Allocate users to available positions in order
      const usersToAllocate = Math.min(waitingUsers.length, availablePositions.length);
      let successCount = 0;
      
      for (let i = 0; i < usersToAllocate; i++) {
        try {
          const user = waitingUsers[i];
          const position = availablePositions[i];
          
          const newEntry: CreateQueueEntryRequest = {
            position: position,
            donation_number: 1,
            user_id: user.id,
            is_receiver: false,
            passed_user_ids: []
          };
          
          await queueAPI.addToQueue(newEntry);
          successCount++;
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error: any) {
          console.error(`Error adding user ${waitingUsers[i].firstName} to position ${availablePositions[i]}:`, error);
          
          // Stop operation on first error
          const errorMessage = successCount === 0 
            ? `Erro ao adicionar usuário à fila: ${error.message || 'Erro desconhecido'}`
            : `Operação interrompida. ${successCount} usuário(s) adicionado(s) com sucesso. Erro ao adicionar o próximo usuário: ${error.message || 'Erro desconhecido'}`;
          
          setAllocationResults({
            successCount,
            totalAttempted: usersToAllocate,
            errorMessage
          });
          setIsResultsModalOpen(true);
          break;
        }
      }
      
      if (successCount > 0) {
        // Refresh the queue data
        await fetchQueueEntries();
      }
      
      // Show results modal
      if (successCount === usersToAllocate) {
        setAllocationResults({
          successCount,
          totalAttempted: usersToAllocate,
          successMessage: `${successCount} usuário(s) adicionado(s) à fila com sucesso!`
        });
      } else if (successCount > 0) {
        setAllocationResults({
          successCount,
          totalAttempted: usersToAllocate,
          successMessage: `${successCount} usuário(s) adicionado(s) à fila com sucesso!`
        });
      }
      
      setIsResultsModalOpen(true);
      
    } catch (error: any) {
      console.error('Error in handleAddToQueue:', error);
      setAllocationResults({
        successCount: 0,
        totalAttempted: 0,
        errorMessage: `Erro ao processar adição à fila: ${error.message || 'Erro desconhecido'}`
      });
      setIsResultsModalOpen(true);
    } finally {
      setAddLoading(false);
    }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const confirmAddToQueue = async (position: number, userId: string) => {
    try {
      setAddLoading(true);
      
      
      // Check if position already exists with a valid user
      const existingEntry = allQueueEntries.find(entry => entry.position === position);
      if (existingEntry && existingEntry.user_id !== null && existingEntry.user_id !== '') {
        alert(`Erro: A posição ${position} já está ocupada por ${existingEntry.user?.firstName || 'um usuário'}.`);
        setAddLoading(false);
        return;
      }
      
      // Check if user is already in queue
      const userInQueue = allQueueEntries.find(entry => entry.user_id === userId);
      if (userInQueue) {
        alert(`Erro: O usuário já está na fila na posição ${userInQueue.position}.`);
        setAddLoading(false);
        return;
      }
      
      const newEntry: CreateQueueEntryRequest = {
        position: position,
        donation_number: 1, // Changed from 0 to 1, as 0 might not be valid
        user_id: userId,
        is_receiver: false,
        passed_user_ids: []
      };


      await queueAPI.addToQueue(newEntry);
      await fetchQueueEntries();
      closeAddModal();
    } catch (error: any) {
      console.error('Error adding to queue:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      // Try to get more detailed error information
      let errorMessage = 'Erro ao adicionar à fila';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 400) {
        errorMessage = 'Erro 400: Dados inválidos enviados para o servidor. Verifique se a posição já existe ou se há outros problemas de validação.';
      }
      
      alert(errorMessage);
    } finally {
      setAddLoading(false);
    }
  };



  const handleDeleteEntry = (entryId: string) => {
    const entry = allQueueEntries.find(e => e.id === entryId);
    if (entry) {
      setEntryToDelete(entry);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      setActionLoading(entryToDelete.id);
      await queueAPI.removeFromQueue(entryToDelete.id);
      await fetchQueueEntries();
      closeDeleteModal();
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      alert(error.message || 'Erro ao remover da fila');
    } finally {
      setActionLoading(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEntryToDelete(null);
  };

  const closeResultsModal = () => {
    setIsResultsModalOpen(false);
    setAllocationResults(null);
  };

  const closeBulkRemoveModal = () => {
    setIsBulkRemoveModalOpen(false);
    setSelectedPositions([]);
  };

  const closeBulkConfirmModal = () => {
    setIsBulkConfirmModalOpen(false);
  };

  const handleBulkRemoveConfirm = async () => {
    try {
      setBulkRemoveLoading(true);
      setIsBulkConfirmModalOpen(false);
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      for (const position of selectedPositions) {
        try {
          const entry = allQueueEntries.find(e => e.position === position);
          if (entry) {
            await queueAPI.removeFromQueue(entry.id);
            successCount++;
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          errorCount++;
          const entry = allQueueEntries.find(e => e.position === position);
          const userName = entry?.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'Usuário desconhecido';
          errors.push(`Posição ${position} (${userName}): ${error.message || 'Erro desconhecido'}`);
        }
      }
      
      // Refresh the queue data
      await fetchQueueEntries();
      
      // Show results
      if (errorCount === 0) {
        setAllocationResults({
          successCount,
          totalAttempted: selectedPositions.length,
          successMessage: `${successCount} posição(ões) removida(s) da fila com sucesso!`
        });
      } else if (successCount > 0) {
        setAllocationResults({
          successCount,
          totalAttempted: selectedPositions.length,
          errorMessage: `Operação parcialmente concluída. ${successCount} posição(ões) removida(s) com sucesso. Erros: ${errors.join('; ')}`
        });
      } else {
        setAllocationResults({
          successCount: 0,
          totalAttempted: selectedPositions.length,
          errorMessage: `Erro ao remover posições: ${errors.join('; ')}`
        });
      }
      
      setIsResultsModalOpen(true);
      closeBulkRemoveModal();
      
    } catch (error: any) {
      console.error('Error in bulk remove:', error);
      setAllocationResults({
        successCount: 0,
        totalAttempted: selectedPositions.length,
        errorMessage: `Erro ao processar remoção em massa: ${error.message || 'Erro desconhecido'}`
      });
      setIsResultsModalOpen(true);
    } finally {
      setBulkRemoveLoading(false);
    }
  };

  const handlePositionSelection = (position: number) => {
    setSelectedPositions(prev => 
      prev.includes(position) 
        ? prev.filter(pos => pos !== position)
        : [...prev, position]
    );
  };

  const handleSelectAllOccupied = () => {
    const occupiedPositions = allQueueEntries
      .filter(entry => entry.user_id !== null && entry.user_id !== '')
      .map(entry => entry.position);
    
    if (selectedPositions.length === occupiedPositions.length) {
      setSelectedPositions([]);
    } else {
      setSelectedPositions(occupiedPositions);
    }
  };

  const closeSwapModal = () => {
    setIsSwapModalOpen(false);
    setSwapPositions([]);
  };

  const closeSwapConfirmModal = () => {
    setIsSwapConfirmModalOpen(false);
  };

  const handleSwapPositionSelection = (position: number) => {
    const entry = allQueueEntries.find(e => e.position === position);
    
    // Only allow selection of occupied positions
    if (!entry || entry.user_id === null || entry.user_id === '') {
      return;
    }

    if (swapPositions.includes(position)) {
      // Deselect if already selected
      setSwapPositions(prev => prev.filter(pos => pos !== position));
    } else if (swapPositions.length < 2) {
      // Select if less than 2 positions selected
      setSwapPositions(prev => [...prev, position]);
    }
  };

  const handleSwapConfirm = async () => {
    if (swapPositions.length !== 2) return;

    try {
      setSwapLoading(true);
      setIsSwapConfirmModalOpen(false);
      
      const [firstPosition, secondPosition] = swapPositions;
      const firstEntry = allQueueEntries.find(e => e.position === firstPosition);
      const secondEntry = allQueueEntries.find(e => e.position === secondPosition);
      
      if (!firstEntry || !secondEntry || !firstEntry.user_id || !secondEntry.user_id) {
        throw new Error('Entradas não encontradas ou inválidas');
      }

      // Call the swap API
      const response = await fetch('/queue/swap', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstUserId: firstEntry.user_id,
          secondUserId: secondEntry.user_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao trocar posições');
      }

      // Refresh the queue data
      await fetchQueueEntries();
      
      // Show success message
      setAllocationResults({
        successCount: 1,
        totalAttempted: 1,
        successMessage: `Posições trocadas com sucesso! ${firstEntry.user?.firstName} (posição ${firstPosition}) ↔ ${secondEntry.user?.firstName} (posição ${secondPosition})`
      });
      setIsResultsModalOpen(true);
      closeSwapModal();
      
    } catch (error: any) {
      console.error('Error in swap positions:', error);
      setAllocationResults({
        successCount: 0,
        totalAttempted: 1,
        errorMessage: `Erro ao trocar posições: ${error.message || 'Erro desconhecido'}`
      });
      setIsResultsModalOpen(true);
    } finally {
      setSwapLoading(false);
    }
  };

  // Calculate users waiting to join the queue
  const getWaitingUsersCount = () => {
    const usersInQueue = allQueueEntries
      .filter(entry => entry.user_id !== null)
      .map(entry => entry.user_id);
    const waitingUsers = allApprovedUsers.filter(user => !usersInQueue.includes(user.id));
    return waitingUsers.length;
  };

  // Calculate occupied slots (entries with user_id that is not null and not empty)
  const getOccupiedSlotsCount = () => {
    return allQueueEntries.filter(entry => entry.user_id !== null && entry.user_id !== '').length;
  };

  // Calculate available slots (total slots minus occupied slots)
  const getAvailableSlotsCount = () => {
    return getTotalSlotsCount() - getOccupiedSlotsCount();
  };

  // Calculate total slots (occupied + available)
  const getTotalSlotsCount = () => {
    return Math.max(allQueueEntries.length, MAX_QUEUE_SLOTS);
  };


  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Debug log to ensure component is rendering
  console.log('🎯 Queue component rendering...', { 
    queueEntries: queueEntries.length, 
    loading, 
    allQueueEntries: allQueueEntries.length,
    allApprovedUsers: allApprovedUsers.length,
    waitingUsers: getWaitingUsersCount(),
    occupiedSlots: getOccupiedSlotsCount(),
    availableSlots: getAvailableSlotsCount(),
    totalSlots: getTotalSlotsCount(),
    maxSlots: MAX_QUEUE_SLOTS,
    userFilter,
    queueEntriesWithNull: allQueueEntries.filter(entry => entry.user_id === null || entry.user_id === '').length,
    queueEntriesWithUser: allQueueEntries.filter(entry => entry.user_id !== null && entry.user_id !== '').length
  });

  return (
    <div className="ml-64 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Debug:</strong> Queue component loaded. Entries: {queueEntries.length}, Loading: {loading.toString()}, All Entries: {allQueueEntries.length}, All Users: {allApprovedUsers.length}, Waiting: {getWaitingUsersCount()}
            </p>
            <p className="text-sm text-yellow-800 mt-2">
              <strong>Slot Debug:</strong> Occupied: {getOccupiedSlotsCount()}, Available: {getAvailableSlotsCount()}, Total: {getTotalSlotsCount()}, Max: {MAX_QUEUE_SLOTS}
            </p>
            <p className="text-sm text-yellow-800 mt-1">
              <strong>Filter Debug:</strong> Current Filter: {userFilter}, Entries with null/empty user_id: {allQueueEntries.filter(entry => entry.user_id === null || entry.user_id === '').length}, Entries with user_id: {allQueueEntries.filter(entry => entry.user_id !== null && entry.user_id !== '').length}
            </p>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Fila de Doações</h1>
              <p className="text-gray-600">Gerenciar fila de doações e receptores</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsBulkRemoveModalOpen(true)}
                disabled={bulkRemoveLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkRemoveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removendo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Retirar em Massa
                  </>
                )}
              </button>
              <button
                onClick={() => setIsSwapModalOpen(true)}
                disabled={swapLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {swapLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Trocando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Trocar Posições
                  </>
                )}
              </button>
              <button
                onClick={handleAddToQueue}
                disabled={addLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar por ordem de chegada
                  </>
                )}
              </button>
              <button
                onClick={fetchQueueEntries}
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Queue Status Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800 mr-3">Vagas de Participantes</h2>
               {getAvailableSlotsCount() === 0 && getTotalSlotsCount() >= MAX_QUEUE_SLOTS && (
                 <div className="flex items-center text-red-600">
                   <AlertCircle className="h-5 w-5 mr-1" />
                   <span className="text-sm font-medium">Todas as vagas estão ocupadas</span>
                 </div>
               )}
            </div>
             <div className="text-right">
               <div className="text-3xl font-bold text-gray-900">{getOccupiedSlotsCount()}/100</div>
               <div className="text-sm text-gray-600">Participantes</div>
             </div>
          </div>

          {/* Progress Bar Section */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="w-full">
               <div className="w-full bg-gray-200 rounded-full h-3">
                 <div 
                   className={`h-3 rounded-full transition-all duration-300 ${
                     getAvailableSlotsCount() === 0 && getTotalSlotsCount() >= MAX_QUEUE_SLOTS
                       ? 'bg-red-500' 
                       : (getOccupiedSlotsCount() / getTotalSlotsCount()) >= 0.8
                         ? 'bg-yellow-500' 
                         : 'bg-green-500'
                   }`}
                   style={{ width: `${getTotalSlotsCount() > 0 ? (getOccupiedSlotsCount() / getTotalSlotsCount()) * 100 : 0}%` }}
                 ></div>
               </div>
            </div>


            {/* Alert Message */}
            {getAvailableSlotsCount() === 0 && getTotalSlotsCount() >= MAX_QUEUE_SLOTS && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    <strong>Nenhuma vaga disponível.</strong> Todas as {getTotalSlotsCount()} vagas estão ocupadas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Crown className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receptores Ativos</p>
                 <p className="text-2xl font-bold text-gray-900">
                   {allQueueEntries.filter(e => e.user_id !== null && e.is_receiver).length}
                 </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Na fila de espera</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getWaitingUsersCount()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar por nome, email ou número de doação..."
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Active Filters Display */}
            {searchTerm && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Busca: "{searchTerm}"
                  <button
                    onClick={clearSearch}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Queue Users Grid */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Usuários
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {searchTerm ? (
                    totalEntries > 0 
                      ? `${totalEntries} resultado${totalEntries !== 1 ? 's' : ''} encontrado${totalEntries !== 1 ? 's' : ''} para "${searchTerm}" - Mostrando ${((currentPage - 1) * entriesPerPage) + 1} a ${Math.min(currentPage * entriesPerPage, totalEntries)}`
                      : `Nenhum resultado encontrado para "${searchTerm}"`
                  ) : (
                    totalEntries > 0 
                      ? `Mostrando ${((currentPage - 1) * entriesPerPage) + 1} a ${Math.min(currentPage * entriesPerPage, totalEntries)} de ${totalEntries} entradas`
                      : 'Nenhuma entrada na fila'
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Filter Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      userFilter === 'all'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setUserFilter('in-queue')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      userFilter === 'in-queue'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Na Fila
                  </button>
                  <button
                    onClick={() => setUserFilter('waiting')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      userFilter === 'waiting'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Em Espera
                  </button>
                </div>
                
                {totalPages > 0 && (
                  <div className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando fila...</p>
            </div>
          ) : (
            <div className="p-6">
              {queueEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm ? 'Nenhuma entrada encontrada' : 'Fila vazia'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? `Não foram encontradas entradas para "${searchTerm}". Tente uma busca diferente.`
                      : 'Não há entradas na fila de doações no momento.'
                    }
                  </p>
                  {searchTerm ? (
                    <button
                      onClick={clearSearch}
                      className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Limpar busca
                    </button>
                  ) : userFilter !== 'waiting' ? (
                    <button
                      onClick={handleAddToQueue}
                      className="mt-4 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Adicionar por ordem de chegada
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-4">
                  {queueEntries.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        {/* User Info */}
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center space-x-2 mb-2">
                               <h4 className="text-sm font-medium text-gray-900 truncate">
                                 {item.type === 'empty-slot' ? (
                                   `Vaga Vazia - Posição ${item.entry.position}`
                                 ) : (
                                   `${item.user.firstName} ${item.user.lastName}`
                                 )}
                               </h4>
                               {item.type === 'queue' ? (
                                 <>
                                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                     item.entry.is_receiver 
                                       ? 'bg-green-100 text-green-800' 
                                       : 'bg-blue-100 text-blue-800'
                                   }`}>
                                     {item.entry.is_receiver ? (
                                       <>
                                         <Crown className="h-3 w-3 mr-1" />
                                         RECEPTOR
                                       </>
                                     ) : (
                                       <>
                                         <Target className="h-3 w-3 mr-1" />
                                         ATIVO
                                       </>
                                     )}
                                   </span>
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Posição {item.entry.position}
                                  </span>
                                 </>
                               ) : item.type === 'empty-slot' ? (
                                 <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                   <Plus className="h-3 w-3 mr-1" />
                                   DISPONÍVEL
                                 </span>
                               ) : (
                                 <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                   <Clock className="h-3 w-3 mr-1" />
                                   EM ESPERA
                                 </span>
                               )}
                             </div>
                            
                             <div className="space-y-1 text-sm text-gray-600">
                               {item.type === 'empty-slot' ? (
                                 <div className="flex items-center">
                                   <Plus className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                   <span>Vaga disponível para ocupação</span>
                                 </div>
                               ) : (
                                 <>
                                   <div className="flex items-center">
                                     <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                     <span className="truncate">{item.user.email}</span>
                                   </div>
                                   {item.type === 'queue' ? (
                                     <>
                                       <div className="flex items-center">
                                         <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                         <span>Adicionado em {formatDate(item.entry.created_at)}</span>
                                       </div>
                                       {item.entry.passed_user_ids.length > 0 && (
                                         <div className="flex items-center">
                                           <AlertCircle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                           <span>{item.entry.passed_user_ids.length} usuário(s) passaram</span>
                                         </div>
                                       )}
                                     </>
                                   ) : (
                                     <div className="flex items-center">
                                       <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                       <span>Aguardando para entrar na fila</span>
                                     </div>
                                   )}
                                 </>
                               )}
                             </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end space-y-3">
                           {/* Status */}
                           <div className="flex items-center text-sm">
                             {item.type === 'queue' ? (
                               item.entry.is_receiver ? (
                                 <span className="text-green-600 flex items-center">
                                   <Crown className="w-3 h-3 mr-1" />
                                   <span className="text-xs">Receptor Ativo</span>
                                 </span>
                               ) : (
                                 <span className="text-blue-600 flex items-center">
                                   <Target className="w-3 h-3 mr-1" />
                                   <span className="text-xs">Posição Ativa</span>
                                 </span>
                               )
                             ) : item.type === 'empty-slot' ? (
                               <span className="text-gray-500 flex items-center">
                                 <Plus className="w-3 h-3 mr-1" />
                                 <span className="text-xs">Disponível</span>
                               </span>
                             ) : (
                               <span className="text-gray-600 flex items-center">
                                 <Clock className="w-3 h-3 mr-1" />
                                 <span className="text-xs">Em Espera</span>
                               </span>
                             )}
                           </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            {item.type === 'queue' ? (
                              <>
                                <button
                                  onClick={() => handleViewEntry(item.id)}
                                  className="flex items-center px-3 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                                  title="Ver detalhes da entrada"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(item.id)}
                                  disabled={actionLoading === item.id}
                                  className="flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Remover
                                </button>
                              </>
                            ) : item.type === 'empty-slot' ? (
                              <button
                                onClick={() => {
                                  setIsAddModalOpen(true);
                                }}
                                className="flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors bg-green-100 text-green-800 hover:bg-green-200"
                                title="Ocupar esta vaga"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Ocupar Vaga
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setIsAddModalOpen(true);
                                }}
                                className="flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Adicionar à Fila
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Go to First Page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Primeira página"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Previous Page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {getPageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  {/* Next Page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                  
                  {/* Go to Last Page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Última página"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-sm text-gray-700">
                  {entriesPerPage} entradas por página
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Allocation Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeAddModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Alocação de Vagas
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Selecione uma vaga disponível para criar uma nova posição na fila
                </p>
              </div>
              <button
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-sm text-gray-600">Vaga Disponível</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">Vaga Ocupada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-sm text-gray-600">Receptor Ativo</span>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                {Array.from({ length: MAX_QUEUE_SLOTS }, (_, index) => {
                  const position = index + 1;
                  const existingEntry = allQueueEntries.find(entry => entry.position === position);
                  const isOccupied = existingEntry && existingEntry.user_id !== null && existingEntry.user_id !== '';
                  const isReceiver = existingEntry && existingEntry.is_receiver;
                  const hasNullUser = existingEntry && (existingEntry.user_id === null || existingEntry.user_id === '');
                  
                  if (isOccupied) {
                    return (
                      <div
                        key={position}
                        className={`p-3 rounded-lg border-2 text-center ${
                          isReceiver 
                            ? 'bg-blue-100 border-blue-300' 
                            : 'bg-gray-200 border-gray-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-gray-700">
                          {position}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {isReceiver ? 'RECEPTOR' : 'OCUPADA'}
                        </div>
                        {existingEntry.user && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {existingEntry.user.firstName}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // This handles both empty positions and positions with null/empty user_id
                    return (
                      <button
                        key={position}
                        onClick={() => {
                          // Find the first available user (not in queue)
                          const usersInQueue = allQueueEntries
                            .filter(entry => entry.user_id !== null && entry.user_id !== '')
                            .map(entry => entry.user_id);
                          const availableUser = allApprovedUsers.find(user => !usersInQueue.includes(user.id));
                          
                          if (availableUser) {
                            confirmAddToQueue(position, availableUser.id);
                          } else {
                            alert('Não há usuários disponíveis para adicionar à fila.');
                          }
                        }}
                        disabled={addLoading}
                        className="p-3 rounded-lg border-2 border-green-300 bg-green-100 hover:bg-green-200 hover:border-green-400 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="text-xs font-bold text-green-700">
                          {position}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          {hasNullUser ? 'VAGA VAZIA' : 'DISPONÍVEL'}
                        </div>
                      </button>
                    );
                  }
                })}
              </div>


              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {MAX_QUEUE_SLOTS - getOccupiedSlotsCount()}
                    </div>
                    <div className="text-sm text-gray-600">Vagas Disponíveis</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {getOccupiedSlotsCount()}
                    </div>
                    <div className="text-sm text-gray-600">Vagas Ocupadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {allQueueEntries.filter(e => e.is_receiver).length}
                    </div>
                    <div className="text-sm text-gray-600">Receptores Ativos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeAddModal}
                disabled={addLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Details Modal */}
      {isModalOpen && selectedEntry && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalhes da Entrada
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Entry Status */}
                <div className="text-center">
                  <div className="flex justify-center space-x-2 mb-4">
                     <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                       selectedEntry.is_receiver 
                         ? 'bg-green-100 text-green-800' 
                         : 'bg-blue-100 text-blue-800'
                     }`}>
                       {selectedEntry.is_receiver ? (
                         <>
                           <Crown className="h-3 w-3 mr-1" />
                           RECEPTOR ATIVO
                         </>
                       ) : (
                         <>
                           <Target className="h-3 w-3 mr-1" />
                           POSIÇÃO ATIVA
                         </>
                       )}
                     </span>
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      Posição {selectedEntry.position}
                    </span>
                  </div>
                </div>

                {/* User Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informações do Usuário
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                       <p className="text-sm text-gray-900">{selectedEntry.user?.firstName} {selectedEntry.user?.lastName}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-500">Email</label>
                       <p className="text-sm text-gray-900">{selectedEntry.user?.email}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-500">ID do Usuário</label>
                       <p className="text-sm text-gray-900 font-mono">{selectedEntry.user?.id}</p>
                     </div>
                  </div>
                </div>

                {/* Queue Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Informações da Fila
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Número da Doação</label>
                      <p className="text-sm text-gray-900">#{selectedEntry.donation_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Posição na Fila</label>
                      <p className="text-sm text-gray-900">{selectedEntry.position}</p>
                    </div>
                     <div>
                       <label className="text-sm font-medium text-gray-500">Status</label>
                       <p className="text-sm text-gray-900">
                         {selectedEntry.is_receiver ? 'Receptor Ativo' : 'Posição Ativa'}
                       </p>
                     </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Usuários que Passaram</label>
                      <p className="text-sm text-gray-900">{selectedEntry.passed_user_ids.length}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Datas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Adicionado em</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedEntry.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedEntry.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => handleDeleteEntry(selectedEntry.id)}
                disabled={actionLoading === selectedEntry.id}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover da Fila
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && entryToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDeleteModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Remover da Fila
              </h2>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900">
                     {entryToDelete.user?.firstName} {entryToDelete.user?.lastName}
                   </h3>
                   <p className="text-sm text-gray-600">{entryToDelete.user?.email}</p>
                 </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja remover este usuário da fila? Esta ação não pode ser desfeita.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Atenção:</p>
                    <p>Se este usuário for o receptor ativo, a fila será reorganizada automaticamente.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeDeleteModal}
                disabled={actionLoading === entryToDelete.id}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteEntry}
                disabled={actionLoading === entryToDelete.id}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === entryToDelete.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removendo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Confirmar Remoção
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Positions Modal */}
      {isSwapModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeSwapModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Trocar Posições
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Selecione duas posições ocupadas para trocar os usuários
                </p>
              </div>
              <button
                onClick={closeSwapModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
                  <span className="text-sm text-gray-600">Posição Selecionada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">Posição Ocupada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-sm text-gray-600">Receptor Ativo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-sm text-gray-600">Posição Vazia</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Instruções:</p>
                    <p>Clique em duas posições ocupadas para trocar os usuários. Você pode clicar novamente para desmarcar uma posição.</p>
                  </div>
                </div>
              </div>

              {/* Selection Status */}
              {swapPositions.length > 0 && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-sm text-purple-700">
                    <span className="font-medium">Posições selecionadas:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {swapPositions.map(position => {
                        const entry = allQueueEntries.find(e => e.position === position);
                        return (
                          <span
                            key={position}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            Posição {position} - {entry?.user?.firstName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Slots Grid */}
              <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                {Array.from({ length: MAX_QUEUE_SLOTS }, (_, index) => {
                  const position = index + 1;
                  const existingEntry = allQueueEntries.find(entry => entry.position === position);
                  const isOccupied = existingEntry && existingEntry.user_id !== null && existingEntry.user_id !== '';
                  const isReceiver = existingEntry && existingEntry.is_receiver;
                  const isSelected = swapPositions.includes(position);
                  
                  if (isOccupied) {
                    return (
                      <button
                        key={position}
                        onClick={() => handleSwapPositionSelection(position)}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          isSelected
                            ? 'bg-purple-100 border-purple-300 hover:bg-purple-200'
                            : isReceiver 
                              ? 'bg-blue-100 border-blue-300 hover:bg-blue-200' 
                              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-gray-700">
                          {position}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {isReceiver ? 'RECEPTOR' : 'OCUPADA'}
                        </div>
                        {existingEntry.user && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {existingEntry.user.firstName}
                          </div>
                        )}
                        {isSelected && (
                          <div className="text-xs text-purple-600 mt-1 font-bold">
                            SELECIONADA
                          </div>
                        )}
                      </button>
                    );
                  } else {
                    return (
                      <div
                        key={position}
                        className="p-3 rounded-lg border-2 border-green-300 bg-green-100 text-center opacity-50"
                      >
                        <div className="text-xs font-bold text-green-700">
                          {position}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          VAZIA
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {swapPositions.length}/2
                    </div>
                    <div className="text-sm text-gray-600">Posições Selecionadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {allQueueEntries.filter(entry => entry.user_id !== null && entry.user_id !== '').length}
                    </div>
                    <div className="text-sm text-gray-600">Posições Ocupadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {MAX_QUEUE_SLOTS - allQueueEntries.filter(entry => entry.user_id !== null && entry.user_id !== '').length}
                    </div>
                    <div className="text-sm text-gray-600">Posições Vazias</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {swapPositions.length === 0 && (
                  <span>Selecione duas posições para trocar</span>
                )}
                {swapPositions.length === 1 && (
                  <span>Selecione mais uma posição</span>
                )}
                {swapPositions.length === 2 && (
                  <span>Pronto para trocar posições</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeSwapModal}
                  disabled={swapLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsSwapConfirmModalOpen(true)}
                  disabled={swapPositions.length !== 2 || swapLoading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Trocar Posições
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Remove Modal */}
      {isBulkRemoveModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeBulkRemoveModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Retirar em Massa
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Selecione as posições ocupadas que deseja remover da fila
                </p>
              </div>
              <button
                onClick={closeBulkRemoveModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-sm text-gray-600">Posição Selecionada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">Posição Ocupada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-sm text-gray-600">Receptor Ativo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-sm text-gray-600">Posição Vazia</span>
                </div>
              </div>

              {/* Select All Button */}
              <div className="mb-4 text-center">
                <button
                  onClick={handleSelectAllOccupied}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors mx-auto"
                >
                  <input
                    type="checkbox"
                    checked={selectedPositions.length > 0 && selectedPositions.length === allQueueEntries.filter(entry => entry.user_id !== null && entry.user_id !== '').length}
                    onChange={handleSelectAllOccupied}
                    className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  Selecionar Todas as Posições Ocupadas ({allQueueEntries.filter(entry => entry.user_id !== null && entry.user_id !== '').length} posições)
                </button>
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                {Array.from({ length: MAX_QUEUE_SLOTS }, (_, index) => {
                  const position = index + 1;
                  const existingEntry = allQueueEntries.find(entry => entry.position === position);
                  const isOccupied = existingEntry && existingEntry.user_id !== null && existingEntry.user_id !== '';
                  const isReceiver = existingEntry && existingEntry.is_receiver;
                  const isSelected = selectedPositions.includes(position);
                  
                  if (isOccupied) {
                    return (
                      <button
                        key={position}
                        onClick={() => handlePositionSelection(position)}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          isSelected
                            ? 'bg-red-100 border-red-300 hover:bg-red-200'
                            : isReceiver 
                              ? 'bg-blue-100 border-blue-300 hover:bg-blue-200' 
                              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-gray-700">
                          {position}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {isReceiver ? 'RECEPTOR' : 'OCUPADA'}
                        </div>
                        {existingEntry.user && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {existingEntry.user.firstName}
                          </div>
                        )}
                        {isSelected && (
                          <div className="text-xs text-red-600 mt-1 font-bold">
                            SELECIONADA
                          </div>
                        )}
                      </button>
                    );
                  } else {
                    return (
                      <div
                        key={position}
                        className="p-3 rounded-lg border-2 border-green-300 bg-green-100 text-center opacity-50"
                      >
                        <div className="text-xs font-bold text-green-700">
                          {position}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          VAZIA
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {selectedPositions.length}
                    </div>
                    <div className="text-sm text-gray-600">Posições Selecionadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {allQueueEntries.filter(entry => entry.user_id !== null && entry.user_id !== '').length}
                    </div>
                    <div className="text-sm text-gray-600">Posições Ocupadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {MAX_QUEUE_SLOTS - allQueueEntries.filter(entry => entry.user_id !== null && entry.user_id !== '').length}
                    </div>
                    <div className="text-sm text-gray-600">Posições Vazias</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {selectedPositions.length > 0 && (
                  <span>{selectedPositions.length} posição(ões) selecionada(s)</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeBulkRemoveModal}
                  disabled={bulkRemoveLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsBulkConfirmModalOpen(true)}
                  disabled={selectedPositions.length === 0 || bulkRemoveLoading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Selecionadas ({selectedPositions.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Remove Confirmation Modal */}
      {isBulkConfirmModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeBulkConfirmModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Confirmar Remoção em Massa
              </h2>
              <button
                onClick={closeBulkConfirmModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Remover {selectedPositions.length} posição(ões)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                Tem certeza que deseja remover {selectedPositions.length} posição(ões) da fila? Esta ação não pode ser desfeita.
              </p>

              {/* Selected Positions List */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Posições selecionadas:</h4>
                <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-md p-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedPositions.map(position => {
                      const entry = allQueueEntries.find(e => e.position === position);
                      return (
                        <span
                          key={position}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          Posição {position}
                          {entry?.user && (
                            <span className="ml-1 text-red-600">
                              ({entry.user.firstName})
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Atenção:</p>
                    <p>Se algum dos usuários selecionados for o receptor ativo, a fila será reorganizada automaticamente.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeBulkConfirmModal}
                disabled={bulkRemoveLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkRemoveConfirm}
                disabled={bulkRemoveLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bulkRemoveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removendo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Confirmar Remoção
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Confirmation Modal */}
      {isSwapConfirmModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeSwapConfirmModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Confirmar Troca de Posições
              </h2>
              <button
                onClick={closeSwapConfirmModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Trocar Posições
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
              
              {swapPositions.length === 2 && (
                <div className="mb-6">
                  {(() => {
                    const [firstPosition, secondPosition] = swapPositions;
                    const firstEntry = allQueueEntries.find(e => e.position === firstPosition);
                    const secondEntry = allQueueEntries.find(e => e.position === secondPosition);
                    
                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Troca de Posições:</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {firstEntry?.user?.firstName} {firstEntry?.user?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">{firstEntry?.user?.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">Posição {firstPosition}</p>
                                <p className="text-xs text-gray-500">
                                  {firstEntry?.is_receiver ? 'Receptor' : 'Ativo'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-center">
                              <div className="flex items-center space-x-2 text-purple-600">
                                <RefreshCw className="h-4 w-4" />
                                <span className="text-sm font-medium">TROCARÁ COM</span>
                                <RefreshCw className="h-4 w-4" />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {secondEntry?.user?.firstName} {secondEntry?.user?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">{secondEntry?.user?.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">Posição {secondPosition}</p>
                                <p className="text-xs text-gray-500">
                                  {secondEntry?.is_receiver ? 'Receptor' : 'Ativo'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja trocar as posições destes dois usuários? Esta ação não pode ser desfeita.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Atenção:</p>
                    <p>Se um dos usuários for o receptor ativo, a fila será reorganizada automaticamente.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeSwapConfirmModal}
                disabled={swapLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSwapConfirm}
                disabled={swapLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {swapLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Trocando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Confirmar Troca
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Results Modal */}
      {isResultsModalOpen && allocationResults && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeResultsModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Resultado da Alocação
              </h2>
              <button
                onClick={closeResultsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {allocationResults.errorMessage ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Erro na Operação
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {allocationResults.errorMessage}
                  </p>
                  {allocationResults.successCount > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Nota:</strong> {allocationResults.successCount} usuário(s) foram adicionado(s) com sucesso antes do erro.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Operação Concluída
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {allocationResults.successMessage}
                  </p>
                  
                  {/* Statistics */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {allocationResults.successCount}
                        </div>
                        <div className="text-sm text-gray-600">Usuários Adicionados</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-600">
                          {allocationResults.totalAttempted}
                        </div>
                        <div className="text-sm text-gray-600">Total Tentativas</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeResultsModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
