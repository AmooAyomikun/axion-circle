package com.cleanreport.repository;
import com.cleanreport.model.entity.PartnerStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PartnerStoreRepository extends JpaRepository<PartnerStore, UUID> {
    List<PartnerStore> findAllByOrderByNameAsc();
}
