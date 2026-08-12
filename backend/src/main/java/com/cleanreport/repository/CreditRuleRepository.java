package com.cleanreport.repository;
import com.cleanreport.model.entity.CreditRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CreditRuleRepository extends JpaRepository<CreditRule, UUID> {
    List<CreditRule> findAllByOrderByCreatedAtAsc();
}
